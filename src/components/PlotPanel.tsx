import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { BarChart3, Settings, Download } from 'lucide-react'
import { Experiment } from './Dashboard'

interface PlotPanelProps {
  experiments: Experiment[]
  selectedExperiments: string[]
}

const PlotPanel: React.FC<PlotPanelProps> = ({ experiments, selectedExperiments }) => {
  const [plotType, setPlotType] = useState<'line' | 'scatter'>('line')
  const [xAxis, setXAxis] = useState<string>('')
  const [yAxis, setYAxis] = useState<string>('')
  const [selectedExperimentForPlot, setSelectedExperimentForPlot] = useState<string>('')

  // Get experiments with data
  const experimentsWithData = experiments.filter(exp => exp.data && exp.data.length > 0)
  
  // Get available columns from the selected experiment
  const availableColumns = useMemo(() => {
    if (!selectedExperimentForPlot) return []
    const experiment = experimentsWithData.find(exp => exp.id === selectedExperimentForPlot)
    if (!experiment || !experiment.data || experiment.data.length === 0) return []
    return Object.keys(experiment.data[0]).filter(key => 
      typeof experiment.data![0][key] === 'number'
    )
  }, [selectedExperimentForPlot, experimentsWithData])

  // Prepare plot data
  const plotData = useMemo(() => {
    if (!selectedExperimentForPlot || !xAxis || !yAxis) return []
    
    const experiment = experimentsWithData.find(exp => exp.id === selectedExperimentForPlot)
    if (!experiment || !experiment.data) return []

    return experiment.data.map((row, index) => ({
      index,
      [xAxis]: row[xAxis],
      [yAxis]: row[yAxis],
      ...row
    }))
  }, [selectedExperimentForPlot, xAxis, yAxis, experimentsWithData])

  // Colors for different experiments
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const renderChart = () => {
    if (!plotData.length) {
      return (
        <div className="h-96 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Select experiment and axes to generate plot</p>
          </div>
        </div>
      )
    }

    const commonProps = {
      width: '100%',
      height: 400,
      data: plotData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    if (plotType === 'scatter') {
      return (
        <ResponsiveContainer {...commonProps}>
          <ScatterChart data={plotData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxis} 
              name={xAxis}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              dataKey={yAxis} 
              name={yAxis}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(3) : value,
                name
              ]}
            />
            <Scatter 
              dataKey={yAxis} 
              fill={colors[0]}
              name={`${yAxis} vs ${xAxis}`}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer {...commonProps}>
        <LineChart data={plotData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxis}
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis 
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip 
            formatter={(value, name) => [
              typeof value === 'number' ? value.toFixed(3) : value,
              name
            ]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={yAxis} 
            stroke={colors[0]}
            strokeWidth={2}
            dot={{ r: 3 }}
            name={`${yAxis} vs ${xAxis}`}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plot Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Plot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Experiment</label>
              <Select value={selectedExperimentForPlot} onValueChange={setSelectedExperimentForPlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experiment" />
                </SelectTrigger>
                <SelectContent>
                  {experimentsWithData.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      <div className="flex items-center gap-2">
                        {exp.name}
                        <Badge variant="outline" className="text-xs">
                          {exp.data?.length} rows
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Plot Type</label>
              <Select value={plotType} onValueChange={(value: 'line' | 'scatter') => setPlotType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">X-Axis</label>
              <Select value={xAxis} onValueChange={setXAxis} disabled={!selectedExperimentForPlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X axis" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Y-Axis</label>
              <Select value={yAxis} onValueChange={setYAxis} disabled={!selectedExperimentForPlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y axis" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedExperimentForPlot && availableColumns.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No numeric columns found in the selected experiment data. 
                Please upload data with numeric values to create plots.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plot Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {selectedExperimentForPlot && xAxis && yAxis 
                ? `${yAxis} vs ${xAxis}` 
                : 'Data Visualization'
              }
            </CardTitle>
            {plotData.length > 0 && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
          {selectedExperimentForPlot && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Experiment:</span>
              <Badge variant="secondary">
                {experiments.find(exp => exp.id === selectedExperimentForPlot)?.name}
              </Badge>
              {plotData.length > 0 && (
                <>
                  <span>•</span>
                  <span>{plotData.length} data points</span>
                </>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Available Experiments */}
      {experimentsWithData.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-medium mb-2">No Data Available</h3>
              <p className="text-sm">
                Upload Excel or CSV files to your experiments to start creating plots.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PlotPanel