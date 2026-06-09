export type DayKey = 'seg'|'ter'|'qua'|'qui'|'sex'|'sab'|'dom'
export type BlockType = 'morning'|'work'|'nexsite'|'train'|'ball'|'meal'|'person'|'college'|'wind'|'sleep'

export interface Task { id: string; activity_id: string; text: string; sort_order: number }

export interface Activity {
  id: string; user_id: string; day_key: DayKey; time: string; name: string
  type: BlockType; icon: string; tag: string|null; detail: string|null
  is_default: boolean; sort_order: number; active: boolean; activity_tasks: Task[]
}
