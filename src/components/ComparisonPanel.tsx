import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { GitCompare, BarChart3, Table as TableIcon, Download } from 'lucide-react'
import { Experiment } from './Dashboard'

interface ComparisonPanelProps {
  experiments: Experiment[]
}

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ experiments }) => {
  const [comparisonMetric, setComparisonMetric] = useState<string>('')
  
  // Get all unique custom column keys across selected experiments
  const allCustomColumns = useMemo(() => {
    const columns = new Set<string>()
    experiments.forEach(exp => {
      Object.keys(exp.customColumns).forEach(key => columns.add(key))
    })
    return Array.from(columns)
  }, [experiments])

  // Get all unique data columns from experiments with data
  const allDataColumns = useMemo(() => {
    const columns = new Set<string>()
    experiments.forEach(exp => {
      if (exp.data && exp.data.length > 0) {
        Object.keys(exp.data[0]).forEach(key => {
          if (typeof exp.data![0][key] === 'number') {
            columns.add(key)
          }
        })
      }
    })
    return Array.from(columns)
  }, [experiments])

  // Prepare comparison chart data
  const chartData = useMemo(() => {
    if (!comparisonMetric) return []
    
    const experimentsWithMetric = experiments.filter(exp => 
      exp.data && exp.data.length > 0 && Object.prototype.hasOwnProperty.call(exp.data[0], comparisonMetric)
    )
    
    if (experimentsWithMetric.length === 0) return []

    // Find the maximum data length to align all experiments
    const maxLength = Math.max(...experimentsWithMetric.map(exp => exp.data!.length))
    
    const data = []
    for (let i = 0; i < maxLength; i++) {
      const point: any = { index: i }
      experimentsWithMetric.forEach(exp => {
        if (exp.data && i < exp.data.length) {
          point[exp.name] = exp.data[i][comparisonMetric]
        }
      })
      data.push(point)
    }
    
    return data
  }, [experiments, comparisonMetric])

  const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Experiment Comparison ({experiments.length} selected)
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {experiments.map((exp) => (
              <Badge key={exp.id} variant="outline" className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(exp.status).split(' ')[0]}`} />
                {exp.name}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TableIcon className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="data-comparison" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Data Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Basic Info Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Experiment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Data Rows</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experiments.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-medium">{exp.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exp.status)}>
                          {exp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{exp.createdAt}</TableCell>
                      <TableCell>{exp.lastModified}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {exp.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {exp.data ? (
                          <Badge variant="outline">{exp.data.length} rows</Badge>
                        ) : (
                          <span className="text-slate-400">No data</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Custom Parameters Comparison */}
          {allCustomColumns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      {experiments.map((exp) => (
                        <TableHead key={exp.id}>{exp.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCustomColumns.map((column) => (
                      <TableRow key={column}>
                        <TableCell className="font-medium capitalize">{column}</TableCell>
                        {experiments.map((exp) => (
                          <TableCell key={exp.id}>
                            {exp.customColumns[column] || (
                              <span className="text-slate-400">—</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data-comparison" className="space-y-4">
          {/* Data Comparison Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Data Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 max-w-xs">
                  <label className="text-sm font-medium mb-2 block">Compare Metric</label>
                  <Select value={comparisonMetric} onValueChange={setComparisonMetric}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric to compare" />
                    </SelectTrigger>
                    <SelectContent>
                      {allDataColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {chartData.length > 0 && (
                  <Button variant="outline" size="sm" className="mt-6">
                    <Download className="w-4 h-4 mr-2" />
                    Export Chart
                  </Button>
                )}
              </div>

              {allDataColumns.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No numeric data available for comparison.</p>
                  <p className="text-sm">Upload data to your experiments to enable data comparison.</p>
                </div>
              )}

              {allDataColumns.length > 0 && !comparisonMetric && (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Select a metric to compare across experiments.</p>
                </div>
              )}

              {chartData.length > 0 && (
                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          typeof value === 'number' ? value.toFixed(3) : value,
                          name
                        ]}
                      />
                      <Legend />
                      {experiments
                        .filter(exp => exp.data && exp.data.length > 0 && Object.prototype.hasOwnProperty.call(exp.data[0], comparisonMetric))
                        .map((exp, index) => (
                          <Line
                            key={exp.id}
                            type="monotone"
                            dataKey={exp.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Summary Statistics */}
          {comparisonMetric && (
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics - {comparisonMetric}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Experiment</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Max</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Std Dev</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {experiments
                      .filter(exp => exp.data && exp.data.length > 0 && Object.prototype.hasOwnProperty.call(exp.data[0], comparisonMetric))
                      .map((exp) => {
                        const values = exp.data!.map(row => row[comparisonMetric]).filter(val => typeof val === 'number')
                        const min = Math.min(...values)
                        const max = Math.max(...values)
                        const avg = values.reduce((sum, val) => sum + val, 0) / values.length
                        const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length)

                        return (
                          <TableRow key={exp.id}>
                            <TableCell className="font-medium">{exp.name}</TableCell>
                            <TableCell>{values.length}</TableCell>
                            <TableCell>{min.toFixed(3)}</TableCell>
                            <TableCell>{max.toFixed(3)}</TableCell>
                            <TableCell>{avg.toFixed(3)}</TableCell>
                            <TableCell>{stdDev.toFixed(3)}</TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComparisonPanel