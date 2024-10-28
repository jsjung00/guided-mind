"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play, Pause, RotateCcw } from "lucide-react";

export function QueryPage() {
  const [query, setQuery] = useState("");
  const [audio, setAudio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  const bgMusicRef = useRef(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      {/* Main content container */}
      <div className="flex-1 flex flex-col p-12 md:pt-24">
        {/* Logo section */}
        <div className="flex-shrink-0 flex items-center justify-center mb-4">
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-450 opacity-75 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full border-4 border-cyan-300 opacity-25 animate-pulse"></div>
            <div className="text-white text-xl font-semibold">Guided Mind</div>
          </div>
        </div>

        {/* Flexible spacer */}
        <div className="flex-1" />

        {/* Fixed bottom input section with safe area padding */}
        <div className="fixed bottom-4 md:bottom-16 left-0 right-0">
          <div className="w-full max-w-sm mx-auto p-4 pb-8 md:pb-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-center space-x-2"
            >
              <Input
                id="query-input"
                type="text"
                placeholder="What's going on?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
      </div>
    </div>
  );
}
