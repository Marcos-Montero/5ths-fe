import { Database } from "@/lib/database.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import Ratings from "./ui/ratings"
import {
  keyColors,
  keyColorStrokes,
  MusicalKey,
  musicalKeys,
} from "./exercise-dashboard"
import { cn } from "@/lib/utils"
const keyToIndex: Record<MusicalKey, number> = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  Gb: 6,
  Db: 7,
  Ab: 8,
  Eb: 9,
  Bb: 10,
  F: 11,
}
const scoreColors = {
  "0": "rgb(255, 0, 0)",
  "1": "rgb(255, 102, 0)",
  "2": "rgb(255, 154, 0)",
  "3": "rgb(255, 195, 0)",
  "4": "rgb(255, 235, 0)",
  "5": "rgb(0, 255, 0)",
}

export const Graph = ({
  exercises,
  recordsByKey,
  selectedKey,
}: {
  exercises: Database["public"]["Tables"]["exercises"]["Row"][]
  recordsByKey: Record<
    MusicalKey,
    Database["public"]["Tables"]["exercise_record"]["Row"][]
  >
  selectedKey: MusicalKey
}) => {
  return (
    <svg
      viewBox="0 0 482 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rotate-[75deg] w-full"
    >
      {musicalKeys.map((mKey) => (
        <CircleSlice
          key={mKey}
          mKey={mKey}
          fill="white"
          ratio={1}
          selectedKey={selectedKey === mKey}
        />
      ))}
      {recordsByKey &&
        Object.entries(recordsByKey).map(([mKey, records]) => {
          // filtrar solo los scores más altos de cada tipo de [ejercicio-tempo]
          const highestScoresByExerciseAndTempo = records.reduce(
            (acc, record) => {
              if (!record.tempo || !record.score) return acc
              if (!acc[`${record.exercise_id}_${record.tempo}`]) {
                acc[`${record.exercise_id}_${record.tempo}`] = record.score
              } else if (
                record.score > acc[`${record.exercise_id}_${record.tempo}`]
              ) {
                acc[`${record.exercise_id}_${record.tempo}`] = record.score
              }
              return acc
            },
            {} as Record<string, number>
          )

          // sumar los scores de cada tempo
          const sumScoresByTempo = Object.entries(
            highestScoresByExerciseAndTempo
          ).reduce((acc, [key, score]) => {
            const [_, tempo] = key.split("_")
            if (!acc[tempo]) {
              acc[tempo] = score
            } else {
              acc[tempo] += score
            }
            return acc
          }, {} as Record<string, number>)

          // calcular la media de los scores de cada tempo
          const averageScoreByTempo = Object.entries(sumScoresByTempo).reduce(
            (acc, [tempo, score]) => {
              acc[tempo] = Math.round(score / (exercises.length || 1))
              return acc
            },
            {} as Record<string, number>
          )
          // ordenar los tempos de mayor a menor
          const sortedScoresByTempo = Object.entries(averageScoreByTempo).sort(
            (a, b) => Number(b[0]) - Number(a[0])
          )
          return sortedScoresByTempo.map(([tempo, score]) => {
            return (
              <CircleSlice
                key={`${mKey}-${tempo}`}
                mKey={mKey as MusicalKey}
                fill={scoreColors[`${(score as 0 | 1 | 2 | 3 | 4) || 0}`]}
                ratio={Number(tempo) / 180}
                records={Object.entries(highestScoresByExerciseAndTempo)
                  .filter(([key]) => key.split("_")[1] === tempo)
                  .map(([key, score]) => ({
                    exercise_id: key.split("_")[0],
                    score: Math.round(score),
                  }))}
                exercises={exercises}
                averageScore={averageScoreByTempo[tempo]}
                tempo={tempo}
                selectedKey={selectedKey === mKey}
              />
            )
          })
        })}
    </svg>
  )
}

export const CircleSlice = ({
  mKey,
  fill,
  ratio = 1,
  records,
  exercises,
  tempo,
  averageScore,
  selectedKey,
}: {
  mKey: MusicalKey
  fill?: string
  ratio?: number
  tempo?: string
  records?: { exercise_id: string; score: number }[]
  exercises?: Database["public"]["Tables"]["exercises"]["Row"][]
  averageScore?: number
  selectedKey: boolean
}) => {
  const CENTER_X = 241
  const CENTER_Y = 251
  const RADIUS = 160
  const SLICES = 12
  const ANGLE = (2 * Math.PI) / SLICES

  const index = keyToIndex[mKey]
  const startAngle = index * ANGLE + Math.PI
  const endAngle = (index + 1) * ANGLE + Math.PI

  const actualRadius = RADIUS * ratio
  const startX = CENTER_X + actualRadius * Math.cos(startAngle)
  const startY = CENTER_Y + actualRadius * Math.sin(startAngle)
  const endX = CENTER_X + actualRadius * Math.cos(endAngle)
  const endY = CENTER_Y + actualRadius * Math.sin(endAngle)

  const path = `
    M${CENTER_X} ${CENTER_Y}
    L${startX} ${startY}
    A${actualRadius} ${actualRadius} 0 0 1 ${endX} ${endY}
    Z
  `
  if (!records || !exercises) {
    return (
      <path
        d={path}
        fill={fill}
        stroke="black"
        className={cn(
          selectedKey && "z-20",
          selectedKey && "stroke-3",
          selectedKey && keyColorStrokes[mKey as keyof typeof keyColorStrokes]
        )}
      />
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <path
            d={path}
            fill={records.length === exercises.length ? fill : "lightgray"}
            stroke="black"
            className={cn(
              selectedKey && "z-20",
              selectedKey && "stroke-3",
              selectedKey &&
                keyColorStrokes[mKey as keyof typeof keyColorStrokes]
            )}
          />
        </TooltipTrigger>
        <TooltipContent className="border bg-background text-foreground max-w-[calc(100vw-1rem)]">
          <div className="flex flex-col">
            <div>
              <div className="flex gap-4 bg-foreground/10 p-2 rounded-md items-center">
                <span className="flex items-center gap-2">
                  Key:
                  <div
                    className={cn(
                      "flex items-center justify-center p-2 rounded-md bg-foreground/10",
                      keyColors[mKey as keyof typeof keyColors]
                    )}
                  >
                    {mKey}
                  </div>
                </span>
                <span>{tempo}bpm</span>
                {records.length === exercises.length ? (
                  <span className="flex items-center">
                    Average Score: ({averageScore}){" "}
                    <Ratings
                      value={averageScore || 0}
                      variant="yellow"
                      className="flex w-32"
                    />
                  </span>
                ) : (
                  <span className="text-sm italic line-clamp-2">
                    Fulfill all exercises in this Key and Tempo to get the score{" "}
                    {records.length}/{exercises.length}
                  </span>
                )}
              </div>
              <hr className="my-2" />
              <div className="grid grid-cols-2 md:grid-cols-4">
                {exercises.map((exercise) => {
                  return (
                    <div key={exercise.id}>
                      <span>{exercise.name}</span>
                      <span className="flex items-center justify-center w-32">
                        <Ratings
                          className="flex w-32"
                          value={
                            records.find((r) => r.exercise_id === exercise.id)
                              ?.score || 0
                          }
                          variant="yellow"
                        />
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
