import React, { useState } from 'react'
import { Plus, Search, Filter, BarChart3, Upload, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import ExperimentCard from './ExperimentCard'
import PlotPanel from './PlotPanel'
import ComparisonPanel from './ComparisonPanel'
import CreateExperimentDialog from './CreateExperimentDialog'

export interface Experiment {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'draft'
  createdAt: string
  lastModified: string
  description: string
  tags: string[]
  data?: any[]
  customColumns: { [key: string]: any }
  plotConfig?: {
    xAxis: string
    yAxis: string
    title: string
  }
}

const Dashboard: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([
    {
      id: '1',
      name: 'Battery Performance Test v1',
      status: 'completed',
      createdAt: '2024-01-15',
      lastModified: '2024-01-16',
      description: 'Initial battery discharge curve analysis',
      tags: ['battery', 'performance'],
      customColumns: {
        voltage: '3.7V',
        current: '2.1A',
        temperature: '25°C',
        cycles: 100
      },
      plotConfig: {
        xAxis: 'time',
        yAxis: 'voltage',
        title: 'Voltage vs Time'
      }
    },
    {
      id: '2',
      name: 'Battery Performance Test v2',
      status: 'running',
      createdAt: '2024-01-17',
      lastModified: '2024-01-17',
      description: 'Optimized discharge parameters',
      tags: ['battery', 'performance', 'optimization'],
      customColumns: {
        voltage: '3.8V',
        current: '1.8A',
        temperature: '23°C',
        cycles: 150
      }
    },
    {
      id: '3',
      name: 'Thermal Analysis Study',
      status: 'draft',
      createdAt: '2024-01-18',
      lastModified: '2024-01-18',
      description: 'Heat dissipation under load',
      tags: ['thermal', 'analysis'],
      customColumns: {
        maxTemp: '85°C',
        ambientTemp: '22°C',
        power: '50W',
        duration: '2h'
      }
    }
  ])

  const [selectedExperiments, setSelectedExperiments] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeView, setActiveView] = useState<'grid' | 'plot' | 'compare'>('grid')

  const filteredExperiments = experiments.filter(exp =>
    exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSelectExperiment = (experimentId: string, checked: boolean) => {
    if (checked) {
      setSelectedExperiments(prev => [...prev, experimentId])
    } else {
      setSelectedExperiments(prev => prev.filter(id => id !== experimentId))
    }
  }

  const handleCreateExperiment = (newExperiment: Omit<Experiment, 'id' | 'createdAt' | 'lastModified'>) => {
    const experiment: Experiment = {
      ...newExperiment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    }
    setExperiments(prev => [experiment, ...prev])
    setShowCreateDialog(false)
  }

  const handleDuplicateExperiment = (experimentId: string) => {
    const original = experiments.find(exp => exp.id === experimentId)
    if (original) {
      const duplicate: Experiment = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      }
      setExperiments(prev => [duplicate, ...prev])
    }
  }

  const handleUpdateExperiment = (experimentId: string, updates: Partial<Experiment>) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === experimentId 
        ? { ...exp, ...updates, lastModified: new Date().toISOString().split('T')[0] }
        : exp
    ))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Hardware Experiments</h1>
              <p className="text-slate-600 mt-1">Track, compare, and visualize your hardware experiments</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('plot')}
                className={activeView === 'plot' ? 'bg-blue-50 border-blue-200' : ''}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Plots
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('compare')}
                disabled={selectedExperiments.length < 2}
                className={activeView === 'compare' ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Compare ({selectedExperiments.length})
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Experiment
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setActiveView('grid')}>
            <Filter className="w-4 h-4 mr-2" />
            All Experiments ({filteredExperiments.length})
          </Button>
        </div>

        {/* Main Content */}
        {activeView === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.map((experiment) => (
              <ExperimentCard
                key={experiment.id}
                experiment={experiment}
                isSelected={selectedExperiments.includes(experiment.id)}
                onSelect={(checked) => handleSelectExperiment(experiment.id, checked)}
                onDuplicate={() => handleDuplicateExperiment(experiment.id)}
                onUpdate={(updates) => handleUpdateExperiment(experiment.id, updates)}
              />
            ))}
          </div>
        )}

        {activeView === 'plot' && (
          <PlotPanel 
            experiments={experiments}
            selectedExperiments={selectedExperiments}
          />
        )}

        {activeView === 'compare' && selectedExperiments.length >= 2 && (
          <ComparisonPanel
            experiments={experiments.filter(exp => selectedExperiments.includes(exp.id))}
          />
        )}
      </div>

      <CreateExperimentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateExperiment={handleCreateExperiment}
      />
    </div>
  )
}

export default Dashboard