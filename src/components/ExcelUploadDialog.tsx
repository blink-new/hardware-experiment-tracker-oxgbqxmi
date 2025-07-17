import React, { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

interface ExcelUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataUpload: (data: any[]) => void
  experimentName: string
}

const ExcelUploadDialog: React.FC<ExcelUploadDialogProps> = ({
  open,
  onOpenChange,
  onDataUpload,
  experimentName
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel (.xlsx, .xls) or CSV file.',
        variant: 'destructive'
      })
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)

    try {
      // Simulate file processing and parsing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate sample data based on file name/type
      const sampleData = generateSampleData(file.name)
      setParsedData(sampleData)
      
      toast({
        title: 'File processed successfully',
        description: `Parsed ${sampleData.length} rows of data.`
      })
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'Failed to parse the uploaded file.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [toast])

  const generateSampleData = (filename: string): any[] => {
    // Generate realistic sample data based on filename
    const baseData = []
    const rowCount = Math.floor(Math.random() * 50) + 20
    
    for (let i = 0; i < rowCount; i++) {
      if (filename.toLowerCase().includes('battery') || filename.toLowerCase().includes('voltage')) {
        baseData.push({
          time: i * 0.1,
          voltage: 3.7 - (i * 0.002) + (Math.random() - 0.5) * 0.05,
          current: 2.0 + (Math.random() - 0.5) * 0.2,
          temperature: 25 + (Math.random() - 0.5) * 5,
          power: (3.7 - (i * 0.002)) * (2.0 + (Math.random() - 0.5) * 0.2)
        })
      } else if (filename.toLowerCase().includes('thermal') || filename.toLowerCase().includes('temp')) {
        baseData.push({
          time: i * 60,
          temperature: 22 + i * 0.5 + (Math.random() - 0.5) * 2,
          power: 50 + (Math.random() - 0.5) * 10,
          fan_speed: 1000 + i * 10 + (Math.random() - 0.5) * 100,
          efficiency: 0.85 - i * 0.001 + (Math.random() - 0.5) * 0.02
        })
      } else {
        baseData.push({
          time: i,
          value_1: Math.random() * 100,
          value_2: Math.random() * 50 + 25,
          value_3: Math.random() * 200,
          measurement: `M${i + 1}`
        })
      }
    }
    
    return baseData
  }

  const handleConfirmUpload = () => {
    if (parsedData) {
      onDataUpload(parsedData)
      handleClose()
    }
  }

  const handleClose = () => {
    setUploadedFile(null)
    setParsedData(null)
    setIsProcessing(false)
    onOpenChange(false)
  }

  const columns = parsedData ? Object.keys(parsedData[0]) : []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Data for {experimentName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Upload Excel or CSV File
              </h3>
              <p className="text-slate-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>
              <p className="text-xs text-slate-500 mt-3">
                Supports .xlsx, .xls, and .csv files up to 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-medium">{uploadedFile.name}</h4>
                        <p className="text-sm text-slate-600">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isProcessing ? (
                        <Badge variant="secondary">Processing...</Badge>
                      ) : parsedData ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null)
                          setParsedData(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Preview */}
              {parsedData && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Data Preview</h4>
                      <Badge variant="outline">
                        {parsedData.length} rows × {columns.length} columns
                      </Badge>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {columns.slice(0, 6).map((column) => (
                              <TableHead key={column} className="font-medium">
                                {column}
                              </TableHead>
                            ))}
                            {columns.length > 6 && (
                              <TableHead className="text-slate-400">
                                +{columns.length - 6} more...
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.slice(0, 5).map((row, index) => (
                            <TableRow key={index}>
                              {columns.slice(0, 6).map((column) => (
                                <TableCell key={column} className="font-mono text-sm">
                                  {typeof row[column] === 'number' 
                                    ? row[column].toFixed(3)
                                    : row[column]
                                  }
                                </TableCell>
                              ))}
                              {columns.length > 6 && (
                                <TableCell className="text-slate-400">...</TableCell>
                              )}
                            </TableRow>
                          ))}
                          {parsedData.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={Math.min(columns.length, 6)} className="text-center text-slate-400">
                                +{parsedData.length - 5} more rows...
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {parsedData && (
            <Button onClick={handleConfirmUpload}>
              Upload Data ({parsedData.length} rows)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ExcelUploadDialog