/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'ui/card'
import { ScrollArea } from 'ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/tabs'
import { Input } from 'ui/input'
import { Label } from 'ui/label'
import {
  Copy,
  Check,
  FileJson,
  BarChart3,
  Network,
  Code,
  Minimize2,
  Maximize2,
  Download,
  Upload,
  Search
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

loader.config({ monaco })

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const CustomNode = ({ data }) => {
  const getNodeColor = (type) => {
    // ... (rest of the getNodeColor function)
    switch (type) {
      case 'object':
        return 'bg-purple-500/20 border-purple-500'
      case 'array':
        return 'bg-cyan-500/20 border-cyan-500'
      case 'string':
        return 'bg-emerald-500/20 border-emerald-500'
      case 'number':
        return 'bg-blue-500/20 border-blue-500'
      case 'boolean':
        return 'bg-amber-500/20 border-amber-500'
      default:
        return 'bg-gray-500/20 border-gray-500'
    }
  }

  return (
    <div
      className={`px-3 py-2 rounded-lg border-2 ${getNodeColor(
        data.type
      )} backdrop-blur-sm min-w-[120px]`}
    >
      {/* Target Handle: For incoming connections (from the parent in the JSON hierarchy) */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={true}
        className="w-2! h-2! bg-primary/70! border-primary!"
      />

      <div className="font-mono text-xs font-semibold text-foreground">{data.label}</div>
      {data.value !== undefined && (
        <div className="font-mono text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
          {data.value}
        </div>
      )}
      {data.count && <div className="text-xs text-muted-foreground mt-1">{data.count} items</div>}

      {/* Source Handle: For outgoing connections (to children in the JSON hierarchy) */}
      {(data.type === 'object' || data.type === 'array') && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={true}
          className="w-2! h-2! bg-primary/70! border-primary!" // Optional: style the handle
        />
      )}
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode
}

export default function JSONTool() {
  const [input, setInput] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [indent, setIndent] = useState('2')
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { resolvedTheme } = useTheme()

  // Generate flow graph from JSON
  const generateFlowGraph = useCallback((data) => {
    const newNodes = []
    const newEdges = []
    let nodeId = 0
    const levelCounts = {} // Track node count at each level

    const getTypeColor = (type) => {
      switch (type) {
        case 'object':
          return '#8b5cf6'
        case 'array':
          return '#06b6d4'
        case 'string':
          return '#10b981'
        case 'number':
          return '#3b82f6'
        case 'boolean':
          return '#f59e0b'
        default:
          return '#6b7280'
      }
    }

    const traverse = (obj, parentId, level, key) => {
      const currentId = `node-${nodeId++}`

      // Track level for positioning
      if (!levelCounts[level]) levelCounts[level] = 0
      const positionInLevel = levelCounts[level]++

      const horizontalSpacing = 300
      const verticalSpacing = 120
      const posX = positionInLevel * horizontalSpacing
      const posY = level * verticalSpacing

      const objType = obj === null ? 'null' : Array.isArray(obj) ? 'array' : typeof obj

      // Create node
      if (objType === 'object') {
        const keys = Object.keys(obj)
        newNodes.push({
          id: currentId,
          type: 'custom',
          position: { x: posX, y: posY },
          data: {
            label: key,
            type: 'object',
            count: keys.length
          }
        })

        // Create edge to parent
        if (parentId !== null) {
          newEdges.push({
            id: `e${parentId}-${currentId}`,
            source: parentId,
            target: currentId,
            type: 'smoothstep',
            animated: level < 3,
            style: { stroke: getTypeColor('object'), strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: getTypeColor('object') }
          })
        }

        // Process children
        Object.entries(obj).forEach(([childKey, childValue]) => {
          traverse(childValue, currentId, level + 1, childKey)
        })
      } else if (objType === 'array') {
        newNodes.push({
          id: currentId,
          type: 'custom',
          position: { x: posX, y: posY },
          data: {
            label: key,
            type: 'array',
            count: obj.length
          }
        })

        // Create edge to parent
        if (parentId !== null) {
          newEdges.push({
            id: `e${parentId}-${currentId}`,
            source: parentId,
            target: currentId,
            type: 'smoothstep',
            animated: level < 3,
            style: { stroke: getTypeColor('array'), strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: getTypeColor('array') }
          })
        }

        // Process array items
        obj.forEach((item, idx) => {
          traverse(item, currentId, level + 1, `[${idx}]`)
        })
      } else {
        // Primitive value
        let displayValue = obj
        if (objType === 'string') displayValue = `"${obj}"`
        else if (obj === null) displayValue = 'null'
        else displayValue = String(obj)

        newNodes.push({
          id: currentId,
          type: 'custom',
          position: { x: posX, y: posY },
          data: {
            label: key,
            type: objType,
            value: displayValue.length > 40 ? displayValue.substring(0, 40) + '...' : displayValue
          }
        })

        // Create edge to parent
        if (parentId !== null) {
          newEdges.push({
            id: `e${parentId}-${currentId}`,
            source: parentId,
            target: currentId,
            type: 'smoothstep',
            style: { stroke: getTypeColor(objType), strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: getTypeColor(objType) }
          })
        }
      }
    }

    // Start traversal
    traverse(data, null, 0, 'root')

    // Center nodes horizontally at each level
    Object.keys(levelCounts).forEach((level) => {
      const nodesAtLevel = newNodes.filter((n) => n.position.y === parseInt(level) * 120)
      const totalWidth = (levelCounts[level] - 1) * 300
      const offset = totalWidth / 2

      nodesAtLevel.forEach((node) => {
        node.position.x = node.position.x - offset + 400 // Center at x=400
      })
    })

    console.log('Generated nodes:', newNodes.length)
    console.log('Generated edges:', newEdges.length)
    console.log('Edges:', newEdges)

    return { nodes: newNodes, edges: newEdges }
  }, [])

  // Parse JSON
  const parseJSON = () => {
    try {
      setError('')
      const parsed = JSON.parse(input)
      setParsedData(parsed)
      analyzeJSON(input)

      // Generate graph
      const { nodes: graphNodes, edges: graphEdges } = generateFlowGraph(parsed, null, 400, 50, 0)
      setNodes(graphNodes)
      setEdges(graphEdges)

      toast.success('JSON parsed successfully')
    } catch (err) {
      setError(err.message)
      setParsedData(null)
      setStats(null)
      setNodes([])
      setEdges([])
      toast.error('Invalid JSON')
    }
  }

  // Analyze JSON
  const analyzeJSON = async (text) => {
    try {
      const { success, stats: jsonStats } = await window.api.json.analyze(text)
      if (success) {
        setStats(jsonStats)
      }
    } catch (err) {
      console.error('Analysis failed:', err)
    }
  }

  // Format JSON
  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, parseInt(indent))
      setInput(formatted)
      toast.success('JSON formatted')
    } catch (err) {
      toast.error('Invalid JSON')
    }
  }

  // Minify JSON
  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setInput(minified)
      toast.success('JSON minified')
    } catch (err) {
      toast.error('Invalid JSON')
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await window.api.clipboard.write(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  // Load from file
  const loadFromFile = async () => {
    try {
      const { canceled, content, error } = await window.api.file.read()
      if (canceled) return
      if (error) {
        toast.error('Failed to load file')
        return
      }
      setInput(content)
      toast.success('File loaded')
    } catch (err) {
      toast.error('Failed to load file')
    }
  }

  // Save to file
  const saveToFile = async () => {
    try {
      const { canceled, error } = await window.api.file.save({
        filename: 'data.json',
        content: input
      })
      if (canceled) return
      if (error) {
        toast.error('Failed to save file')
        return
      }
      toast.success('File saved')
    } catch (err) {
      toast.error('Failed to save file')
    }
  }

  // Search in JSON
  const searchInJSON = useMemo(() => {
    if (!parsedData || !searchQuery) return null

    const results = []
    const search = (obj, path = '') => {
      if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key
          if (key.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({ path: currentPath, key, value })
          }
          if (
            typeof value === 'string' &&
            value.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            results.push({ path: currentPath, key, value })
          }
          search(value, currentPath)
        })
      }
    }
    search(parsedData)
    return results
  }, [parsedData, searchQuery])

  // Chart data
  const typeChartData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Objects', value: stats.objects },
      { name: 'Arrays', value: stats.arrays },
      { name: 'Strings', value: stats.strings },
      { name: 'Numbers', value: stats.numbers },
      { name: 'Booleans', value: stats.booleans },
      { name: 'Nulls', value: stats.nulls }
    ].filter((item) => item.value > 0)
  }, [stats])

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight flex gap-2 items-center">
            <FileJson className="w-6 h-6 text-primary" /> JSON Visualizer & Analyzer
          </h1>
          <p className="text-sm text-muted-foreground">
            Parse, visualize, analyze and explore JSON data with interactive tools
          </p>
        </div>

        {/* Editor Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">JSON Input</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Paste or type your JSON data
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadFromFile}>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Load
                </Button>
                <Button variant="outline" size="sm" onClick={saveToFile} disabled={!input}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border rounded-lg overflow-hidden">
              <Editor
                height="300px"
                language="json"
                value={input}
                onChange={setInput}
                theme={resolvedTheme == 'dark' ? 'vs-dark' : 'vs-light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on'
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Indent:</Label>
                <Input
                  type="number"
                  min="2"
                  max="8"
                  value={indent}
                  onChange={(e) => setIndent(e.target.value)}
                  className="w-16 h-8 text-xs"
                />
              </div>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" onClick={parseJSON} disabled={!input}>
                  <FileJson className="w-3.5 h-3.5 mr-1.5" />
                  Parse
                </Button>
                <Button size="sm" variant="secondary" onClick={formatJSON} disabled={!input}>
                  <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                  Format
                </Button>
                <Button size="sm" variant="secondary" onClick={minifyJSON} disabled={!input}>
                  <Minimize2 className="w-3.5 h-3.5 mr-1.5" />
                  Minify
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(input)}
                  disabled={!input}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization Tabs */}
        {parsedData && (
          <Tabs defaultValue="graph" className="w-full">
            <div className="flex justify-center mb-4">
              <TabsList className="grid w-full max-w-2xl grid-cols-4">
                <TabsTrigger value="graph" className="text-sm">
                  <Network className="w-3.5 h-3.5 mr-1.5" />
                  Graph
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-sm">
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="search" className="text-sm">
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="raw" className="text-sm">
                  <Code className="w-3.5 h-3.5 mr-1.5" />
                  Raw
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Graph View */}
            <TabsContent value="graph">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Interactive Graph View</CardTitle>
                  <CardDescription className="text-xs">
                    Drag nodes, zoom, and explore your JSON structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px] border rounded-lg bg-muted/30">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      nodeTypes={nodeTypes}
                      fitView
                      attributionPosition="bottom-left"
                    >
                      <Background />
                      <Controls />
                      <MiniMap
                        nodeColor={(node) => {
                          switch (node.data.type) {
                            case 'object':
                              return '#8b5cf6'
                            case 'array':
                              return '#06b6d4'
                            case 'string':
                              return '#10b981'
                            case 'number':
                              return '#3b82f6'
                            default:
                              return '#6b7280'
                          }
                        }}
                      />
                    </ReactFlow>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Stats Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Structure Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Max Depth</span>
                        <span className="text-sm font-semibold">{stats?.maxDepth || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Total Keys</span>
                        <span className="text-sm font-semibold">{stats?.totalKeys || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Objects</span>
                        <span className="text-sm font-semibold">{stats?.objects || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Arrays</span>
                        <span className="text-sm font-semibold">{stats?.arrays || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Strings</span>
                        <span className="text-sm font-semibold">{stats?.strings || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Numbers</span>
                        <span className="text-sm font-semibold">{stats?.numbers || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-muted-foreground">Booleans</span>
                        <span className="text-sm font-semibold">{stats?.booleans || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Nulls</span>
                        <span className="text-sm font-semibold">{stats?.nulls || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={typeChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {typeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Bar Chart */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Type Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={typeChartData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Search */}
            <TabsContent value="search">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Search JSON</CardTitle>
                  <CardDescription className="text-xs">
                    Search for keys or values in your JSON data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search keys or values..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline" onClick={() => setSearchQuery('')}>
                      Clear
                    </Button>
                  </div>

                  {searchInJSON && searchInJSON.length > 0 && (
                    <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
                      <div className="space-y-3">
                        {searchInJSON.map((result, idx) => (
                          <Card key={idx} className="bg-card/50">
                            <CardContent className="p-3">
                              <div className="space-y-1">
                                <p className="text-xs font-mono text-muted-foreground">
                                  {result.path}
                                </p>
                                <p className="text-sm font-mono">
                                  <span className="text-purple-500">{result.key}:</span>{' '}
                                  <span className="text-emerald-500">
                                    {typeof result.value === 'string'
                                      ? `"${result.value}"`
                                      : JSON.stringify(result.value)}
                                  </span>
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {searchQuery && (!searchInJSON || searchInJSON.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No results found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Raw View */}
            <TabsContent value="raw">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Raw JSON</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Editor
                      height="500px"
                      language="json"
                      value={JSON.stringify(parsedData, null, 2)}
                      theme={resolvedTheme == 'dark' ? 'vs-dark' : 'vs-light'}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ScrollArea>
  )
}
