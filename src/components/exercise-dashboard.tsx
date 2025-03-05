import { Accordion } from "@/components/ui/accordion"
import { useEffect } from "react"

import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { ExerciseTreeNode } from "./exercise-tree-node"

type Exercise = {
  id: string
  name: string
}

type TreeNode = {
  id: string
  name: string
  children: Map<string, TreeNode>
}

export const ExerciseDashboard = () => {
  const [exerciseTree, setExerciseTree] = useState<Map<string, TreeNode>>(
    new Map()
  )

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = (await supabase
        .from("exercises")
        .select("*")) as { data: Exercise[]; error: Error | null }

      if (error) {
        console.error("Error fetching exercises:", error)
      } else {
        setExerciseTree(buildExerciseTree(data))
      }
    }
    fetchExercises()
  }, [])

  const buildExerciseTree = (exercises: Exercise[]): Map<string, TreeNode> => {
    const tree = new Map<string, TreeNode>()

    exercises.forEach((exercise) => {
      const parts = exercise.name.split("/")
      let currentLevel = tree

      parts.forEach((part, index) => {
        if (!currentLevel.has(part)) {
          currentLevel.set(part, {
            id: index === parts.length - 1 ? exercise.id : `${part}-${index}`,
            name: part,
            children: new Map(),
          })
        }
        if (index < parts.length - 1) {
          currentLevel = currentLevel.get(part)!.children
        }
      })
    })

    return tree
  }

  return (
    <div>
      <h4 className="text-2xl font-bold mb-4">Exercise Dashboard</h4>
      <Accordion type="single">
        <ExerciseTreeNode nodes={exerciseTree} />
      </Accordion>
    </div>
  )
}
