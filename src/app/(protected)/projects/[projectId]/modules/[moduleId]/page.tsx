"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getSessionUser } from "@/lib/utils";

interface Module {
  _id: string;
  name: string;
  projectId: string;
  flowType: "Waterfall" | "Agile";
  owner: string;
  contributorIds: string[];
}

interface Member {
  _id: string;
  userId: string;
  projectId: string;
  role: "Manager" | "BA" | "Developer" | "QA" | "Guest";
  user: {
    name: string;
    email: string;
  };
}

interface Task {
  _id: string;
  title: string;
  moduleId: string;
  assigneeId: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  startDate: string;
  deadline: string;
  hasConflict: boolean;
  description?: string;
  status?: string;
  dependencies?: string[]; // Array of task IDs that this task depends on
}

// Kanban board columns
const KANBAN_COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

// Task component for Kanban board
const KanbanTask = ({ task, members }: { task: Task; members: Member[] }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded-lg p-3 mb-2 bg-white shadow-sm cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between">
        <h3 className="font-semibold text-sm">{task.title}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            task.priority === "Critical"
              ? "bg-red-100 text-red-800"
              : task.priority === "High"
              ? "bg-orange-100 text-orange-800"
              : task.priority === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {task.priority}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {members.find((m) => m.userId === task.assigneeId)?.user.name ||
          "Unknown"}
      </p>
      {task.hasConflict && (
        <span className="text-red-500 text-xs font-medium">Conflict</span>
      )}
    </div>
  );
};

// Column component for Kanban board
const KanbanColumn = ({
  column,
  tasks,
  members,
}: {
  column: { id: string; title: string };
  tasks: Task[];
  members: Member[];
}) => {
  return (
    <div className="flex-1 min-w-[250px]">
      <h3 className="font-semibold mb-2">{column.title}</h3>
      <div className="bg-muted p-3 rounded-lg min-h-[100px]">
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanTask key={task._id} task={task} members={members} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default function ModulePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const moduleId = params.moduleId as string;
  const [module, setModule] = useState<Module | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<
    "Critical" | "High" | "Medium" | "Low"
  >("Medium");
  const [newTaskStartDate, setNewTaskStartDate] = useState<Date | undefined>(
    new Date()
  );
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>(
    new Date()
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchModule = async () => {
      if (status === "loading") return;

      if (!getSessionUser(session)) {
        router.push("/login");
        return;
      }

      try {
        // Fetch module details
        const response = await fetch(`/api/modules/${moduleId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push(`/projects/${projectId}`);
            return;
          }
          throw new Error("Failed to fetch module");
        }
        const data = await response.json();
        setModule(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching the module"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }
        const data = await response.json();
        setMembers(data);
        if (data.length > 0) {
          setNewTaskAssignee(data[0].userId); // Set default assignee to first member
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching members"
        );
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/modules/${moduleId}/tasks`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching tasks"
        );
      }
    };

    fetchModule();
    fetchMembers();
    fetchTasks();
  }, [session, status, projectId, moduleId, router]);

  const handleCreateTask = async () => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          assigneeId: newTaskAssignee,
          priority: newTaskPriority,
          startDate: newTaskStartDate,
          deadline: newTaskDeadline,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setIsCreateTaskOpen(false);
      toast.success("Task created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the task"
      );
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    // If there's no over, or it's the same column, do nothing
    if (!over || active.id === over.id) {
      return;
    }

    // Find the task being dragged
    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;

    // Find the new status based on the column it was dropped in
    const newStatus = over.id as string;

    // If the status hasn't changed, do nothing
    if (task.status === newStatus) {
      return;
    }

    try {
      // Update the task status via API
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task status");
      }

      const updatedTask = await response.json();

      // Update the task in the local state
      setTasks(tasks.map((t) => (t._id === task._id ? updatedTask : t)));
      toast.success("Task status updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the task status"
      );
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!getSessionUser(session)) {
    return null; // Router will redirect to login
  }

  if (!module) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Module Not Found</CardTitle>
            <CardDescription>
              The requested module could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/projects/${projectId}`)}>
              Back to Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group tasks by status for Kanban board
  const tasksByStatus = KANBAN_COLUMNS.map((column) => ({
    ...column,
    tasks: tasks.filter((task) => task.status === column.id),
  }));

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{module.name}</h1>
          <p className="text-muted-foreground">Module in project</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button>Create Task</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>
                  Create a new task for this module.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input
                    id="taskTitle"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task Title"
                  />
                </div>
                <div>
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Task Description"
                  />
                </div>
                <div>
                  <Label htmlFor="taskAssignee">Assignee</Label>
                  <Select
                    value={newTaskAssignee}
                    onValueChange={setNewTaskAssignee}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select
                    value={newTaskPriority}
                    onValueChange={(value) => setNewTaskPriority(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taskStartDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${
                          !newTaskStartDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTaskStartDate ? (
                          format(newTaskStartDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTaskStartDate}
                        onSelect={setNewTaskStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="taskDeadline">Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${
                          !newTaskDeadline && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTaskDeadline ? (
                          format(newTaskDeadline, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTaskDeadline}
                        onSelect={setNewTaskDeadline}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage tasks in this module</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-muted-foreground">No tasks created yet.</p>
            ) : module.flowType === "Waterfall" ? (
              // Waterfall view - Table
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow
                      key={task._id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => openTaskDetail(task)}
                    >
                      <TableCell className="font-medium">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        {members.find((m) => m.userId === task.assigneeId)?.user
                          .name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            task.priority === "Critical"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "High"
                              ? "bg-orange-100 text-orange-800"
                              : task.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        {task.startDate
                          ? new Date(task.startDate).toLocaleDateString()
                          : "Not set"}
                      </TableCell>
                      <TableCell>
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "Not set"}
                      </TableCell>
                      <TableCell>
                        {task.hasConflict && (
                          <span className="text-red-500 text-sm font-medium">
                            Conflict
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              // Agile view - Kanban Board
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  <SortableContext
                    items={tasks.map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasksByStatus.map((column) => (
                      <KanbanColumn
                        key={column.id}
                        column={column}
                        tasks={column.tasks}
                        members={members}
                      />
                    ))}
                  </SortableContext>
                </div>
                <DragOverlay>
                  {activeTask ? (
                    <KanbanTask task={activeTask} members={members} />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedTask?.title}</SheetTitle>
            <SheetDescription>Task details and information</SheetDescription>
          </SheetHeader>
          {selectedTask && (
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Assignee</h3>
                <p className="text-muted-foreground">
                  {members.find((m) => m.userId === selectedTask.assigneeId)
                    ?.user.name || "Unknown"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Priority</h3>
                <p
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    selectedTask.priority === "Critical"
                      ? "bg-red-100 text-red-800"
                      : selectedTask.priority === "High"
                      ? "bg-orange-100 text-orange-800"
                      : selectedTask.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedTask.priority}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Dates</h3>
                <div className="space-y-2">
                  <p>
                    Start Date:{" "}
                    {selectedTask.startDate
                      ? new Date(selectedTask.startDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                  <p>
                    Deadline:{" "}
                    {selectedTask.deadline
                      ? new Date(selectedTask.deadline).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Status</h3>
                <p className="text-muted-foreground capitalize">
                  {selectedTask.status || "Not set"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Dependencies</h3>
                <p className="text-muted-foreground">
                  {selectedTask.dependencies &&
                  selectedTask.dependencies.length > 0
                    ? selectedTask.dependencies
                        .map(
                          (dep) =>
                            tasks.find((t) => t._id === dep)?.title ||
                            "Unknown Task"
                        )
                        .join(", ")
                    : "No dependencies"}
                </p>
              </div>

              {selectedTask.hasConflict && (
                <div>
                  <h3 className="text-lg font-semibold">Conflict</h3>
                  <p className="text-red-500">
                    This task has a scheduling conflict with another task.
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
