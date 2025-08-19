"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { ChartTooltip, ChartTooltipContent } from "./ui/chart"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import {
  MessageSquare,
  Package,
  BarChart3,
  Plus,
  TrendingUp,
  Users,
  ShoppingCart,
  Clock,
  MessageCircle,
  Phone,
} from "lucide-react"

export function SupplierDashboard() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Organic Fertilizer",
      category: "Fertilizers",
      price: 450,
      stock: 120,
      status: "In Stock",
    },
    {
      id: 2,
      name: "Wheat Seeds (HD-2967)",
      category: "Seeds",
      price: 25,
      stock: 500,
      status: "In Stock",
    },
    {
      id: 3,
      name: "Pest Control Spray",
      category: "Pesticides",
      price: 320,
      stock: 5,
      status: "Low Stock",
    },
    {
      id: 4,
      name: "Drip Irrigation Kit",
      category: "Equipment",
      price: 2500,
      stock: 0,
      status: "Out of Stock",
    },
  ])

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  })

  const farmerQueries = [
    {
      id: 1,
      farmer: "Rajesh Kumar",
      question: "Looking for high-quality wheat seeds for 10 acres. What varieties do you recommend?",
      location: "Punjab",
      timestamp: "2 hours ago",
      category: "Seeds",
      responses: 2,
    },
    {
      id: 2,
      farmer: "Priya Sharma",
      question: "Need organic fertilizer for tomato cultivation. What's the best option?",
      location: "Haryana",
      timestamp: "5 hours ago",
      category: "Fertilizers",
      responses: 1,
    },
    {
      id: 3,
      farmer: "Vikram Singh",
      question: "Required drip irrigation system for 5-acre farm. Please share details and pricing.",
      location: "Rajasthan",
      timestamp: "1 day ago",
      category: "Equipment",
      responses: 0,
    },
  ]

  const analytics = {
    totalSales: 125000,
    totalOrders: 89,
    activeProducts: products.filter((p) => p.status === "In Stock").length,
    customerQueries: farmerQueries.length,
  }

  const salesData = [
    { month: "Jan", sales: 45000, orders: 32 },
    { month: "Feb", sales: 52000, orders: 41 },
    { month: "Mar", sales: 48000, orders: 35 },
    { month: "Apr", sales: 61000, orders: 48 },
    { month: "May", sales: 55000, orders: 42 },
    { month: "Jun", sales: 67000, orders: 53 },
    { month: "Jul", sales: 72000, orders: 58 },
    { month: "Aug", sales: 68000, orders: 51 },
    { month: "Sep", sales: 75000, orders: 62 },
    { month: "Oct", sales: 82000, orders: 67 },
    { month: "Nov", sales: 89000, orders: 73 },
    { month: "Dec", sales: 95000, orders: 78 },
  ]

  const categoryData = [
    { category: "Seeds", sales: 285000, color: "hsl(var(--chart-1))" },
    { category: "Fertilizers", sales: 195000, color: "hsl(var(--chart-2))" },
    { category: "Equipment", sales: 145000, color: "hsl(var(--chart-3))" },
    { category: "Pesticides", sales: 125000, color: "hsl(var(--chart-4))" },
  ]

  const weeklyData = [
    { day: "Mon", queries: 12, responses: 10 },
    { day: "Tue", queries: 15, responses: 13 },
    { day: "Wed", queries: 8, responses: 8 },
    { day: "Thu", queries: 18, responses: 15 },
    { day: "Fri", queries: 22, responses: 19 },
    { day: "Sat", queries: 25, responses: 22 },
    { day: "Sun", queries: 14, responses: 12 },
  ]

  const supplierComparisonData = [
    {
      supplier: "AgriTech Solutions",
      deliveryTime: 2.5,
      qualityScore: 94,
      priceIndex: 85,
      marketShare: 28,
      customerSatisfaction: 4.8,
      totalOrders: 156,
    },
    {
      supplier: "FarmSupply Pro",
      deliveryTime: 3.2,
      qualityScore: 89,
      priceIndex: 78,
      marketShare: 22,
      customerSatisfaction: 4.5,
      totalOrders: 134,
    },
    {
      supplier: "Green Valley Co",
      deliveryTime: 4.1,
      qualityScore: 91,
      priceIndex: 92,
      marketShare: 18,
      customerSatisfaction: 4.6,
      totalOrders: 98,
    },
    {
      supplier: "Rural Connect",
      deliveryTime: 3.8,
      qualityScore: 87,
      priceIndex: 88,
      marketShare: 15,
      customerSatisfaction: 4.3,
      totalOrders: 87,
    },
    {
      supplier: "Harvest Hub",
      deliveryTime: 5.2,
      qualityScore: 83,
      priceIndex: 95,
      marketShare: 12,
      customerSatisfaction: 4.1,
      totalOrders: 76,
    },
    {
      supplier: "You",
      deliveryTime: 2.8,
      qualityScore: 96,
      priceIndex: 82,
      marketShare: 5,
      customerSatisfaction: 4.9,
      totalOrders: 89,
    },
  ]

  const performanceMetrics = [
    { metric: "Quality Score", you: 96, industry: 88, benchmark: 90 },
    { metric: "Delivery Speed", you: 92, industry: 75, benchmark: 85 },
    { metric: "Price Competitiveness", you: 88, industry: 85, benchmark: 80 },
    { metric: "Customer Satisfaction", you: 98, industry: 82, benchmark: 85 },
    { metric: "Order Fulfillment", you: 94, industry: 78, benchmark: 85 },
  ]

  const monthlyCompetitorData = [
    { month: "Jan", you: 45000, competitor1: 52000, competitor2: 38000, competitor3: 41000 },
    { month: "Feb", you: 52000, competitor1: 48000, competitor2: 42000, competitor3: 39000 },
    { month: "Mar", you: 48000, competitor1: 55000, competitor2: 35000, competitor3: 44000 },
    { month: "Apr", you: 61000, competitor1: 58000, competitor2: 48000, competitor3: 47000 },
    { month: "May", you: 55000, competitor1: 62000, competitor2: 41000, competitor3: 52000 },
    { month: "Jun", you: 67000, competitor1: 65000, competitor2: 55000, competitor3: 58000 },
  ]

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.category && newProduct.price && newProduct.stock) {
      const product = {
        id: products.length + 1,
        name: newProduct.name,
        category: newProduct.category,
        price: Number.parseInt(newProduct.price),
        stock: Number.parseInt(newProduct.stock),
        status: Number.parseInt(newProduct.stock) > 0 ? "In Stock" : "Out of Stock",
      }
      setProducts([...products, product])
      setNewProduct({ name: "", category: "", price: "", stock: "", description: "" })
    }
  }

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case "In Stock":
        return "default"
      case "Low Stock":
        return "secondary"
      case "Out of Stock":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="w-full h-screen ai-gradient-bg p-6 overflow-auto">
      <div className="w-full h-full space-y-6">
        <div className="ai-responsive-grid">
          <div className="lg:col-span-2">
            <Card className="ai-enhanced-card bg-card/80 backdrop-blur-sm border-border shadow-lg h-full">
              <CardContent className="ai-responsive-padding">
                <div className="flex items-center gap-4 mb-4">
                  <MessageCircle className="w-8 h-8" style={{ color: "var(--ai-primary)" }} />
                  <div>
                    <h3 className="text-xl text-foreground font-medium">Connect via SMS</h3>
                    <p className="text-muted-foreground">Respond to farmers instantly</p>
                  </div>
                </div>
                <div className="text-foreground mb-4">
                  Farmers can reach you at <strong>9876543210</strong>
                  <div className="mt-2 text-sm text-muted-foreground">Get SMS notifications for new queries</div>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent bg-transparent"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Setup SMS Alerts
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="ai-enhanced-card text-white shadow-lg" style={{ background: "var(--ai-primary)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Sales</p>
                    <p className="text-2xl font-bold">₹{(analytics.totalSales / 1000).toFixed(0)}K</p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="ai-enhanced-card text-white shadow-lg" style={{ background: "var(--ai-secondary)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Orders</p>
                    <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="ai-enhanced-card text-white shadow-lg" style={{ background: "var(--ai-success)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Products</p>
                    <p className="text-2xl font-bold">{analytics.activeProducts}</p>
                  </div>
                  <Package className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="ai-enhanced-card text-white shadow-lg" style={{ background: "var(--ai-accent)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Queries</p>
                    <p className="text-2xl font-bold">{analytics.customerQueries}</p>
                  </div>
                  <Users className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="queries" className="w-full flex-1">
          <TabsList className="grid w-full grid-cols-3 bg-muted h-12">
            <TabsTrigger
              value="queries"
              className="flex items-center gap-2 data-[state=active]:text-white"
              style={
                {
                  "--tw-data-state-active-bg": "var(--ai-primary)",
                } as React.CSSProperties
              }
            >
              <MessageSquare className="w-5 h-5" />
              Queries
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="flex items-center gap-2 data-[state=active]:text-white"
              style={
                {
                  "--tw-data-state-active-bg": "var(--ai-primary)",
                } as React.CSSProperties
              }
            >
              <Package className="w-5 h-5" />
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 data-[state=active]:text-white"
              style={
                {
                  "--tw-data-state-active-bg": "var(--ai-primary)",
                } as React.CSSProperties
              }
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queries" className="mt-6">
            <Card className="ai-enhanced-card shadow-lg">
              <CardHeader className="pb-4 bg-muted/50">
                <CardTitle className="text-xl text-foreground">Recent Farmer Queries</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Respond to farmer questions and connect with potential customers
                </CardDescription>
              </CardHeader>
              <CardContent className="ai-responsive-padding">
                <div className="ai-desktop-grid">
                  {farmerQueries.map((query) => (
                    <Card key={query.id} className="ai-enhanced-card border-border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{query.farmer}</span>
                            <Badge variant="outline" className="border-border text-foreground">
                              {query.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{query.question}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{query.location}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {query.timestamp}
                              </span>
                            </div>
                            <Button size="sm" className="text-white" style={{ background: "var(--ai-primary)" }}>
                              Respond
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <Card className="ai-enhanced-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/50">
                <div>
                  <CardTitle className="text-xl text-foreground">Product Inventory</CardTitle>
                  <CardDescription className="text-muted-foreground">Manage your agricultural products</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="text-white" style={{ background: "var(--ai-primary)" }}>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base text-foreground">Add New Product</DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Enter the details for your new agricultural product
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-sm text-foreground">
                          Product Name
                        </Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g., Organic Fertilizer"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-sm text-foreground">
                          Category
                        </Label>
                        <Select onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Seeds">Seeds</SelectItem>
                            <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                            <SelectItem value="Pesticides">Pesticides</SelectItem>
                            <SelectItem value="Equipment">Equipment</SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="price" className="text-sm text-foreground">
                            Price (₹)
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="0"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock" className="text-sm text-foreground">
                            Stock
                          </Label>
                          <Input
                            id="stock"
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            placeholder="0"
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleAddProduct}
                        className="w-full text-sm text-white"
                        style={{ background: "var(--ai-primary)" }}
                      >
                        Add Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="ai-responsive-padding">
                <div className="ai-desktop-grid">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="ai-enhanced-card border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-foreground">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <Badge variant={getStockBadgeVariant(product.status)}>{product.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-lg text-foreground">₹{product.price}</span>
                        <span className="text-muted-foreground">Stock: {product.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="ai-enhanced-card shadow-lg xl:col-span-2">
                <CardHeader className="pb-4 bg-muted/50">
                  <CardTitle className="text-xl text-foreground">Supplier Performance Ranking</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Comprehensive comparison across key performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={supplierComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="supplier"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="qualityScore" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="customerSatisfaction" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="ai-enhanced-card shadow-lg">
                <CardHeader className="pb-4 bg-muted/50">
                  <CardTitle className="text-xl text-foreground">Market Share Analysis</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your position vs competitors in the market
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={supplierComparisonData.sort((a, b) => b.marketShare - a.marketShare)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="supplier"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="marketShare" radius={[4, 4, 0, 0]}>
                          {supplierComparisonData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.supplier === "You"
                                  ? "hsl(var(--chart-1))"
                                  : [
                                      "hsl(var(--chart-2))",
                                      "hsl(var(--chart-3))",
                                      "hsl(var(--chart-4))",
                                      "hsl(var(--chart-5))",
                                      "hsl(var(--chart-1))",
                                    ][index % 5]
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="ai-enhanced-card shadow-lg">
                <CardHeader className="pb-4 bg-muted/50">
                  <CardTitle className="text-xl text-foreground">Performance Benchmarking</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your performance vs industry average and benchmarks
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceMetrics} margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="metric"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="you" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="industry" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="benchmark" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="ai-enhanced-card shadow-lg xl:col-span-2">
                <CardHeader className="pb-4 bg-muted/50">
                  <CardTitle className="text-xl text-foreground">Competitive Sales Analysis</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Monthly sales comparison with top competitors
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyCompetitorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="you"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="competitor1"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="competitor2"
                          stroke="hsl(var(--chart-3))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="competitor3"
                          stroke="hsl(var(--chart-4))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--chart-4))", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="ai-enhanced-card shadow-lg">
                <CardHeader className="pb-4 bg-muted/50">
                  <CardTitle className="text-xl text-foreground">Delivery Performance</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Average delivery times across suppliers
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={supplierComparisonData.sort((a, b) => a.deliveryTime - b.deliveryTime)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="supplier"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="deliveryTime" radius={[4, 4, 0, 0]}>
                          {supplierComparisonData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.supplier === "You"
                                  ? "hsl(var(--chart-2))"
                                  : [
                                      "hsl(var(--chart-3))",
                                      "hsl(var(--chart-4))",
                                      "hsl(var(--chart-5))",
                                      "hsl(var(--chart-1))",
                                      "hsl(var(--chart-2))",
                                    ][index % 5]
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="ai-enhanced-card shadow-lg">
                <CardHeader className="pb-4 bg-muted/50">
                  <CardTitle className="text-xl text-foreground">Price Competitiveness</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Price index comparison (lower is more competitive)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={supplierComparisonData.sort((a, b) => a.priceIndex - b.priceIndex)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="supplier"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="priceIndex" radius={[4, 4, 0, 0]}>
                          {supplierComparisonData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.supplier === "You"
                                  ? "hsl(var(--chart-5))"
                                  : [
                                      "hsl(var(--chart-1))",
                                      "hsl(var(--chart-2))",
                                      "hsl(var(--chart-3))",
                                      "hsl(var(--chart-4))",
                                      "hsl(var(--chart-1))",
                                    ][index % 5]
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
