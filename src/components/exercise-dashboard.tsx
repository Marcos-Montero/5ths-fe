import { useEffect } from "react"

import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { Button } from "./ui/button"
import { DropdownMenuTrigger } from "./ui/dropdown-menu"
import { DropdownMenu } from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useMetronome } from "@/hooks/use-metronome"
import { DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu"
import { Database } from "@/lib/database.types"
import { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { Graph } from "./graph"
import { RecordTable } from "./record-table"
import { Slider } from "./ui/slider"
import { ChevronDown } from "lucide-react"

export type MusicalKey =
  | "C"
  | "G"
  | "D"
  | "A"
  | "E"
  | "B"
  | "F"
  | "Bb"
  | "Eb"
  | "Ab"
  | "Db"
  | "Gb"

export const musicalKeys: MusicalKey[] = [
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
  "Gb",
]

export const keyColors = {
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
  Gb: "bg-purple-500",
} as const
export const keyColorBorders = {
  C: "border-red-500",
  F: "border-orange-500",
  G: "border-yellow-500",
  Bb: "border-lime-500",
  D: "border-green-500",
  Eb: "border-emerald-500",
  A: "border-cyan-500",
  Ab: "border-sky-500",
  E: "border-blue-500",
  Db: "border-indigo-500",
  B: "border-violet-500",
  Gb: "border-purple-500",
}
export const keyColorStrokes = {
  C: "stroke-red-500",
  F: "stroke-orange-500",
  G: "stroke-yellow-500",
  Bb: "stroke-lime-500",
  D: "stroke-green-500",
  Eb: "stroke-emerald-500",
  A: "stroke-cyan-500",
  Ab: "stroke-sky-500",
  E: "stroke-blue-500",
  Db: "stroke-indigo-500",
  B: "stroke-violet-500",
}

export const ExerciseDashboard = ({ user }: { user: User }) => {
  const [exercises, setExercises] = useState<
    Database["public"]["Tables"]["exercises"]["Row"][]
  >([])
  const [tempo, setTempo] = useState(60)
  const [selectedKey, setSelectedKey] = useState<(typeof musicalKeys)[number]>(
    musicalKeys[0]
  )
  const [exerciseRecords, setExerciseRecords] = useState<
    Database["public"]["Tables"]["exercise_record"]["Row"][]
  >([])
  const { isPlaying, toggleMetronome } = useMetronome(tempo)
  const [refetching, setRefetching] = useState(false)
  const [fullRecords, setFullRecords] = useState<
    Database["public"]["Tables"]["exercise_record"]["Row"][] | null
  >(null)
  const handleScoreChange = async (exerciseId: string, score: number) => {
    const { error: errorDeletingExistingRecord } = await supabase
      .from("exercise_record")
      .delete()
      .eq("exercise_id", exerciseId)
      .eq("user_id", user.id)
      .eq("key", selectedKey)
      .eq("tempo", tempo)
    const { error: errorCreatingNewRecord } = await supabase
      .from("exercise_record")
      .insert({
        exercise_id: exerciseId,
        user_id: user.id,
        key: selectedKey,
        tempo: tempo,
        score: score,
      })
    if (errorDeletingExistingRecord || errorCreatingNewRecord) {
      toast.error("Error updating exercise record")
    } else {
      toast.success("Score updated")
      setRefetching(true)
    }
  }

  const removeRecord = async (exerciseId: string) => {
    const { error } = await supabase
      .from("exercise_record")
      .delete()
      .eq("exercise_id", exerciseId)
      .eq("user_id", user.id)
      .eq("key", selectedKey)
      .eq("tempo", tempo)
    if (error) {
      toast.error("Error removing exercise record")
    } else {
      toast.success("Exercise record removed")
      setRefetching(true)
    }
  }

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("order", { ascending: true })
      if (error) {
        console.error("Error fetching exercises:", error)
      } else {
        setExercises(data)
      }
    }
    fetchExercises()
  }, [])
  useEffect(() => {
    const fetchExerciseRecords = async () => {
      const { data, error } = await supabase
        .from("exercise_record")
        .select("*")
        .eq("user_id", user.id)
        .eq("key", selectedKey)
        .eq("tempo", tempo)
      if (error) {
        console.error("Error fetching exercise records:", error)
      } else {
        setExerciseRecords(data)
      }
    }
    fetchExerciseRecords()
    setRefetching(false)
  }, [refetching, selectedKey, tempo])

  const recordsByKey = fullRecords?.reduce((acc, record) => {
    if (!acc[record.key as MusicalKey]) {
      acc[record.key as MusicalKey] = []
    }
    acc[record.key as MusicalKey].push(record)
    return acc
  }, {} as Record<MusicalKey, Database["public"]["Tables"]["exercise_record"]["Row"][]>)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from("exercise_record")
        .select("*")
        .eq("user_id", user.id)
      if (error) {
        toast.error(`Error fetching exercise records for ${user.email}`)
      } else {
        setFullRecords(data)
      }
    }
    fetchData()
    setRefetching(false)
  }, [user?.id, refetching])

  return (
    <>
      {recordsByKey && (
        <Graph
          exercises={exercises}
          recordsByKey={recordsByKey}
          selectedKey={selectedKey}
        />
      )}
      <div className="w-full flex flex-col gap-12">
        <div className="flex items-center justify-between gap-4 w-full">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "rounded-xl shadow-xl px-4 py-2 text-xl font-bold border cursor-pointer flex items-center justify-between",
                keyColors[selectedKey as keyof typeof keyColors]
              )}
            >
              {selectedKey}
              <ChevronDown className={cn("size-4")} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="grid grid-cols-4 gap-1 bg-black/20 backdrop-blur-sm">
              {musicalKeys.map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSelectedKey(key)}
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
          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col gap-2">
              <span>{tempo} bpm</span>
              <Slider
                min={45}
                max={180}
                step={5}
                value={[tempo]}
                onValueChange={([value]: [number]) => setTempo(value)}
                customColor={keyColors[selectedKey as keyof typeof keyColors]}
                className="w-[120px]"
              />
            </div>
            <Button
              size="icon"
              variant={isPlaying ? "secondary" : "outline"}
              onClick={toggleMetronome}
            >
              {isPlaying ? "⏹" : "▶"}
            </Button>
          </div>
          <span className="text-xs">
            <span className="font-bold text-3xl">{exerciseRecords.length}</span>
            /{exercises.length} exercises done
          </span>
        </div>
        <RecordTable
          exercises={exercises}
          exerciseRecords={exerciseRecords}
          handleScoreChange={handleScoreChange}
          removeRecord={removeRecord}
          refetching={refetching}
          borderColor={
            keyColorBorders[selectedKey as keyof typeof keyColorBorders]
          }
        />
      </div>
    </>
  )
}
