import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { Experiment } from './Dashboard'

interface CreateExperimentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateExperiment: (experiment: Omit<Experiment, 'id' | 'createdAt' | 'lastModified'>) => void
}

const CreateExperimentDialog: React.FC<CreateExperimentDialogProps> = ({
  open,
  onOpenChange,
  onCreateExperiment
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as Experiment['status'],
    tags: [] as string[],
    customColumns: {} as { [key: string]: any }
  })
  
  const [newTag, setNewTag] = useState('')
  const [newColumnKey, setNewColumnKey] = useState('')
  const [newColumnValue, setNewColumnValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onCreateExperiment({
      name: formData.name,
      description: formData.description,
      status: formData.status,
      tags: formData.tags,
      customColumns: formData.customColumns
    })

    // Reset form
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      tags: [],
      customColumns: {}
    })
    setNewTag('')
    setNewColumnKey('')
    setNewColumnValue('')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addCustomColumn = () => {
    if (newColumnKey.trim() && newColumnValue.trim()) {
      setFormData(prev => ({
        ...prev,
        customColumns: {
          ...prev.customColumns,
          [newColumnKey.trim()]: newColumnValue.trim()
        }
      }))
      setNewColumnKey('')
      setNewColumnValue('')
    }
  }

  const removeCustomColumn = (keyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      customColumns: Object.fromEntries(
        Object.entries(prev.customColumns).filter(([key]) => key !== keyToRemove)
      )
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Experiment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Experiment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Battery Performance Test v3"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the experiment..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Experiment['status']) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Custom Columns */}
          <div>
            <Label>Custom Parameters</Label>
            <p className="text-sm text-slate-600 mb-3">
              Add custom fields to track specific parameters for this experiment
            </p>
            
            {Object.entries(formData.customColumns).length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(formData.customColumns).map(([key, value]) => (
                  <div key={key} className="bg-slate-50 rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm capitalize">{key}</div>
                      <div className="text-sm text-slate-600">{value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomColumn(key)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newColumnKey}
                onChange={(e) => setNewColumnKey(e.target.value)}
                placeholder="Parameter name (e.g., voltage)"
                className="flex-1"
              />
              <Input
                value={newColumnValue}
                onChange={(e) => setNewColumnValue(e.target.value)}
                placeholder="Value (e.g., 3.7V)"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColumn())}
              />
              <Button type="button" onClick={addCustomColumn} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              Create Experiment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateExperimentDialog