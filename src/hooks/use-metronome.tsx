import { useRef, useState, useEffect } from "react"

export const useMetronome = (bpm: number) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<number | null>(null)

  const playTick = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.value = 1000
    gainNode.gain.value = 1

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContextRef.current.currentTime + 0.05
    )
    oscillator.stop(audioContextRef.current.currentTime + 0.05)
  }

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 1000
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      playTick()
      intervalRef.current = window.setInterval(playTick, intervalMs)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, bpm])

  const toggleMetronome = () => {
    if (!isPlaying) {
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  return { isPlaying, toggleMetronome }
}
