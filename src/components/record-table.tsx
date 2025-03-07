import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table"
import { Database } from "@/lib/database.types"
import { RecordRow } from "./record-row"
import { cn } from "@/lib/utils"

export const RecordTable = ({
  exercises,
  exerciseRecords,
  handleScoreChange,
  removeRecord,
  refetching,
  borderColor,
}: {
  exercises: Database["public"]["Tables"]["exercises"]["Row"][]
  exerciseRecords: Database["public"]["Tables"]["exercise_record"]["Row"][]
  handleScoreChange: (exerciseId: string, score: number) => void
  removeRecord: (exerciseId: string) => void
  refetching: boolean
  borderColor: string
}) => {
  return (
    <div
      className={cn(
        "rounded-xl overflow-x-hidden overflow-y-auto h-[320px] md:h-[540px] border-[0.5px] scrollbar-hidden",
        borderColor
      )}
    >
      <Table className="text-xs md:text-base">
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Hands</TableHead>
            <TableHead>Score</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((exercise) => (
            <RecordRow
              key={exercise.id}
              exercise={exercise}
              score={
                exerciseRecords.find(
                  (record) => record.exercise_id === exercise.id
                )?.score ?? 0
              }
              handleScoreChange={(score) =>
                handleScoreChange(exercise.id, score)
              }
              isLoading={refetching}
              removeRecord={() => removeRecord(exercise.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
