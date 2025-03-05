import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ExerciseTreeLeaf } from "./exercise-tree-leaf"

type TreeNode = {
  id: string
  name: string
  children: Map<string, TreeNode>
}

export const ExerciseTreeNode = ({
  nodes,
}: {
  nodes: Map<string, TreeNode>
}) => {
  return Array.from(nodes.entries()).map(([_, node]) => (
    <AccordionItem key={node.id} value={node.id}>
      <AccordionTrigger>{node.name}</AccordionTrigger>
      <AccordionContent>
        {node.children.size > 0 ? (
          <Accordion
            type="single"
            collapsible
            defaultValue={node.id}
            className="pl-4"
          >
            <ExerciseTreeNode nodes={node.children} />
          </Accordion>
        ) : (
          <ExerciseTreeLeaf node={node} />
        )}
      </AccordionContent>
    </AccordionItem>
  ))
}
