import React, { useState } from 'react'
import { MoreHorizontal, Copy, Upload, BarChart3, Calendar, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Experiment } from './Dashboard'
import ExcelUploadDialog from './ExcelUploadDialog'

interface ExperimentCardProps {
  experiment: Experiment
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onDuplicate: () => void
  onUpdate: (updates: Partial<Experiment>) => void
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  isSelected,
  onSelect,
  onDuplicate,
  onUpdate
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    name: experiment.name,
    description: experiment.description,
    tags: experiment.tags.join(', ')
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSaveEdit = () => {
    onUpdate({
      name: editForm.name,
      description: editForm.description,
      tags: editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    })
    setShowEditDialog(false)
  }

  const handleDataUpload = (data: any[]) => {
    onUpdate({ data })
    setShowUploadDialog(false)
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-medium text-slate-900 truncate">
                {experiment.name}
              </CardTitle>
              <Badge className={`mt-2 ${getStatusColor(experiment.status)}`}>
                {experiment.status}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          {experiment.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {experiment.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Custom Columns */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(experiment.customColumns).map(([key, value]) => (
            <div key={key} className="bg-slate-50 rounded p-2">
              <div className="font-medium text-slate-700 capitalize">{key}</div>
              <div className="text-slate-600">{value}</div>
            </div>
          ))}
        </div>

        {/* Data Status */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            {experiment.lastModified}
          </div>
          <div className="flex items-center gap-1">
            {experiment.data && (
              <Badge variant="outline" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                {experiment.data.length} rows
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploadDialog(true)}
              className="h-7 px-2 text-xs"
            >
              <Upload className="w-3 h-3 mr-1" />
              {experiment.data ? 'Update' : 'Upload'}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Experiment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Experiment name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Experiment description"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="battery, performance, optimization"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Excel Upload Dialog */}
      <ExcelUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onDataUpload={handleDataUpload}
        experimentName={experiment.name}
      />
    </Card>
  )
}

export default ExperimentCard