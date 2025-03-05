import { Button } from "./ui/button"
import Ratings from "./ui/ratings"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useEffect, useState, useTransition } from "react"
import { useMetronome } from "@/hooks/use-metronome"
import { User } from "@supabase/supabase-js"
import { toast } from "sonner"

const keys = [
  "C",
  "F",
  "G",
  "Bb",
  "D",
  "Eb",
  "A",
  "Ab",
  "E",
  "Db",
  "B",
  "G#",
] as const

const keyColors = {
  C: "bg-red-500",
  F: "bg-orange-500",
  G: "bg-yellow-500",
  Bb: "bg-lime-500",
  D: "bg-green-500",
  Eb: "bg-emerald-500",
  A: "bg-cyan-500",
  Ab: "bg-sky-500",
  E: "bg-blue-500",
  Db: "bg-indigo-500",
  B: "bg-violet-500",
  "G#": "bg-purple-500",
} as const

type TreeNode = {
  id: string
  name: string
  children: Map<string, TreeNode>
}

export const ExerciseTreeLeaf = ({ node }: { node: TreeNode }) => {
  const [tempo, setTempo] = useState(60)
  const [score, setScore] = useState(0)
  const [key, setKey] = useState<(typeof keys)[number]>(keys[0])
  const { isPlaying, toggleMetronome } = useMetronome(tempo)
  const [user, setUser] = useState<User | null>(null)
  const [lastRecord, setLastRecord] = useState<{
    score: number
    tempo: number
  } | null>(null)
  const [isSubmitting, startSubmitting] = useTransition()

  const submitExerciseRecord = async () => {
    if (!user || !node.id) return
    startSubmitting(async () => {
      const { error } = await supabase.from("exercise_record").insert({
        user_id: user.id,
        exercise_id: node.id,
        key,
        tempo,
        score,
      })
      if (error) {
        toast.error("Error submitting exercise record")
      } else {
        toast.success("Exercise record submitted")
      }
    })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !node.id) return
      const { data, error } = await supabase
        .from("exercise_record")
        .select("score, tempo")
        .eq("exercise_id", node.id)
        .eq("user_id", user.id)
        .eq("key", key)
        .eq("tempo", tempo)
        .order("tempo", { ascending: false })
        .order("score", { ascending: false })
        .limit(1)
      if (error) {
        toast.error(
          `Error fetching exercise records for ${node.name} key ${key} tempo ${tempo}`
        )
      } else {
        setLastRecord(data[0])
      }
    }
    fetchData()
  }, [node.id, user?.id, key, tempo])
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl p-4 bg-neutral-100 dark:bg-neutral-700 w-full">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "rounded-xl shadow-xl px-4 size-full text-xl font-bold border cursor-pointer",
            keyColors[key as keyof typeof keyColors]
          )}
        >
          {key}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="grid grid-cols-4 gap-1 bg-black/20 backdrop-blur-sm">
          {keys.map((key) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setKey(key)}
              className={cn(
                "cursor-pointer shadow-xl",
                keyColors[key as keyof typeof keyColors]
              )}
            >
              {key}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-col items-center justify-center gap-2">
        <span>{tempo} bpm</span>
        <input
          type="range"
          min={45}
          max={180}
          value={tempo}
          step={5}
          onChange={(e) => setTempo(Number(e.target.value))}
        />
        <Button
          size="icon"
          variant={isPlaying ? "secondary" : "outline"}
          onClick={toggleMetronome}
        >
          {isPlaying ? "⏹" : "▶"}
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Ratings
          value={score}
          onValueChange={setScore}
          className="w-full flex justify-center items-center"
        />
        {lastRecord && (
          <>
            <span className="text-xs text-gray-500">Best Record: </span>
            <Ratings
              value={lastRecord.score}
              className="flex scale-50 opacity-50"
            />{" "}
            <span className="text-xs text-gray-500">
              {lastRecord.tempo}
              bpm
            </span>
          </>
        )}
      </div>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={submitExerciseRecord}
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit"}
      </Button>
    </div>
  )
}
