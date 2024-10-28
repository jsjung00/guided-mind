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
    bgMusicRef.current.volume = 0.2;

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs flex flex-col items-center space-y-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-blue-450 opacity-75 animate-pulse"></div>
          <div className="absolute inset-4 rounded-full border-4 border-cyan-300 opacity-25 animate-pulse"></div>
          <div className="text-white text-xl font-semibold">Guided Mind</div>
        </div>
        <div className="w-full mt-80">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <label htmlFor="query-input" className="sr-only">
              What&apos;s going on?
            </label>
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
              onClick={handleSubmit}
              disabled={isLoading || query.length < 1}
              variant={audio ? "default" : "secondary"}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
