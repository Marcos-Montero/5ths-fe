import { Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { TableRow } from "./ui/table"

import { TableCell } from "./ui/table"
import { Database } from "@/lib/database.types"
import Ratings from "./ui/ratings"
import { cn } from "@/lib/utils"

export const RecordRow = ({
  exercise,
  score,
  handleScoreChange,
  isLoading,
  removeRecord,
}: {
  exercise: Database["public"]["Tables"]["exercises"]["Row"]
  score: number
  handleScoreChange: (score: number) => void
  isLoading: boolean
  removeRecord: () => void
}) => {
  const split = exercise.name.split("/")
  const category = split.length == 2 ? split[0] : split[0] + " " + split[1]
  const name =
    split[split.length - 1] === "Left hand"
      ? "L"
      : split[split.length - 1] === "Right hand"
      ? "R"
      : "Both"

  return (
    <TableRow key={exercise.id} className="text-left h-10">
      <TableCell>{category}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>
        <Ratings
          value={score}
          onValueChange={isLoading ? undefined : handleScoreChange}
          className={cn(
            "cursor-pointer flex justify-center items-center md:size-20 size-12",
            isLoading && "opacity-50"
          )}
        />
      </TableCell>
      <TableCell>
        <Button
          size="icon"
          variant="outline"
          onClick={removeRecord}
          className="cursor-pointer"
        >
          <Trash2 />
        </Button>
      </TableCell>
    </TableRow>
  )
}
