"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play, Pause, InfoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const InfoPopup = () => {
  return (
    <div className="fixed top-4 right-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="secondary" className="rounded-full">
            <InfoIcon className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>About the app</DialogTitle>
            <DialogDescription>
              I created this app to reframe negative thinking and ease stressful
              moments. For ~1000 runs it costs me $20 in OpenAI credits. If you
              find this useful and would like to keep the app running and free,
              please consider supporting. You can reach me with my contact
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            <h4 className="font-medium">Contact Information</h4>
            <div className="text-muted-foreground">
              <p>Email: justinsoljung@gmail.com</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export function QueryPage() {
  const [query, setQuery] = useState("");
  const [audio, setAudio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  const bgMusicRef = useRef(null);
  const inputRef = useRef(null);

  const { toast } = useToast();

  // Initialize audio object on client-side only
  useEffect(() => {
    audioRef.current = new Audio();
    bgMusicRef.current = new Audio();
    bgMusicRef.current.src = "/audio/background_meditation.mp3";
    bgMusicRef.current.volume = 0.3;

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = "";
      }
    };
  }, []);

  // start background music if audio is on
  useEffect(() => {
    if (audio && !bgMusicPlaying && isPlaying) {
      console.log("clicking bg play");
      bgMusicRef.current
        .play()
        .then(() => setBgMusicPlaying(true))
        .catch((error) =>
          console.error("Background music autoplay failed:", error)
        );
    }
  }, [audio, bgMusicPlaying, isPlaying]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // if restart (iff audio is true)
    if (audio) {
      restartPrompt();
    }

    if (query.length < 1) {
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      // set up audio
      audioRef.current.src = audioUrl;
      setAudio(audioUrl);
      //set up audio event listeners
      audioRef.current.onended = () => {
        setBgMusicPlaying(false);
        setIsPlaying(false);
        // Stop background music when main audio ends
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      };

      // autoplay
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Autoplay failed");
      }

      setQuery("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audio) return;

    if (isPlaying) {
      audioRef.current.pause();
      bgMusicRef.current.pause();
    } else {
      audioRef.current.play();
      bgMusicRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restartPrompt = () => {
    audioRef.current.pause();
    setAudio(null);
    setIsLoading(true);
    bgMusicRef.current.pause();
    bgMusicRef.current.currentTime = 0; //reset to beginning
    setBgMusicPlaying(false);
  };

  const handleInputBlur = () => {
    // Small delay to ensure keyboard is fully closed
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <main className="min-h-screen relative flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      {<InfoPopup />}
      <div className="flex-grow flex flex-col items-center justify-start p-2 md:p-12">
        <div className="w-full pt-6 md:pt-18 flex justify-center">
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-16 rounded-full border-4 border-white-450 opacity-75 animate-ping" />
            )}
            <div className="absolute inset-4 rounded-full border-4 border-blue-450 opacity-75 animate-pulse" />
            <div className="absolute inset-8 rounded-full border-4 border-cyan-300 opacity-25 animate-pulse" />
            <div className="text-white text-xl font-semibold">Guided Mind</div>
          </div>
        </div>
        <div className="max-w-sm mx-auto pt-20 md:pt-32 flex">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Input
              ref={inputRef}
              id="query-input"
              type="text"
              placeholder="What's on your mind?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={handleInputBlur}
              className="w-full bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            />
            {audio && (
              <Button
                type="button"
                size="icon"
                onClick={togglePlayPause}
                variant={audio ? "secondary" : "default"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || query.length < 1}
              variant={audio ? "default" : "secondary"}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
