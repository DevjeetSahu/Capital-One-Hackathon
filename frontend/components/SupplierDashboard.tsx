import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  Phone
} from 'lucide-react';

export function SupplierDashboard() {
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: "Organic Fertilizer", 
      category: "Fertilizers", 
      price: 450, 
      stock: 120, 
      status: "In Stock" 
    },
    { 
      id: 2, 
      name: "Wheat Seeds (HD-2967)", 
      category: "Seeds", 
      price: 25, 
      stock: 500, 
      status: "In Stock" 
    },
    { 
      id: 3, 
      name: "Pest Control Spray", 
      category: "Pesticides", 
      price: 320, 
      stock: 5, 
      status: "Low Stock" 
    },
    { 
      id: 4, 
      name: "Drip Irrigation Kit", 
      category: "Equipment", 
      price: 2500, 
      stock: 0, 
      status: "Out of Stock" 
    }
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  });

  const farmerQueries = [
    {
      id: 1,
      farmer: "Rajesh Kumar",
      question: "Looking for high-quality wheat seeds for 10 acres. What varieties do you recommend?",
      location: "Punjab",
      timestamp: "2 hours ago",
      category: "Seeds",
      responses: 2
    },
    {
      id: 2,
      farmer: "Priya Sharma", 
      question: "Need organic fertilizer for tomato cultivation. What's the best option?",
      location: "Haryana",
      timestamp: "5 hours ago",
      category: "Fertilizers",
      responses: 1
    },
    {
      id: 3,
      farmer: "Vikram Singh",
      question: "Required drip irrigation system for 5-acre farm. Please share details and pricing.",
      location: "Rajasthan",
      timestamp: "1 day ago",
      category: "Equipment",
      responses: 0
    }
  ];

  const analytics = {
    totalSales: 125000,
    totalOrders: 89,
    activeProducts: products.filter(p => p.status === "In Stock").length,
    customerQueries: farmerQueries.length
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.category && newProduct.price && newProduct.stock) {
      const product = {
        id: products.length + 1,
        name: newProduct.name,
        category: newProduct.category,
        price: parseInt(newProduct.price),
        stock: parseInt(newProduct.stock),
        status: parseInt(newProduct.stock) > 0 ? "In Stock" : "Out of Stock"
      };
      setProducts([...products, product]);
      setNewProduct({ name: '', category: '', price: '', stock: '', description: '' });
    }
  };

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case "In Stock": return "default";
      case "Low Stock": return "secondary";
      case "Out of Stock": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* SMS Service Promotion */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-blue-800">Connect via SMS</h3>
              <p className="text-sm text-gray-600">Respond to farmers instantly</p>
            </div>
          </div>
          <div className="text-sm text-gray-700 mb-3">
            Farmers can reach you at <strong>9876543210</strong>
            <div className="mt-1 text-xs text-gray-600">
              Get SMS notifications for new queries
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
            <Phone className="w-4 h-4 mr-2" />
            Setup SMS Alerts
          </Button>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Sales</p>
                <p className="text-lg">₹{(analytics.totalSales/1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Orders</p>
                <p className="text-lg">{analytics.totalOrders}</p>
              </div>
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Products</p>
                <p className="text-lg">{analytics.activeProducts}</p>
              </div>
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Queries</p>
                <p className="text-lg">{analytics.customerQueries}</p>
              </div>
              <Users className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queries" className="flex items-center gap-1 text-xs">
            <MessageSquare className="w-3 h-3" />
            Queries
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-1 text-xs">
            <Package className="w-3 h-3" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-3 h-3" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queries" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Farmer Queries</CardTitle>
              <CardDescription className="text-sm">
                Respond to farmer questions and connect with potential customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {farmerQueries.map((query) => (
                  <Card key={query.id} className="border">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{query.farmer}</span>
                          <Badge variant="outline" className="text-xs">
                            {query.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {query.question}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{query.location}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {query.timestamp}
                            </span>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-7">
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

        <TabsContent value="inventory" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Product Inventory</CardTitle>
                <CardDescription className="text-sm">Manage your agricultural products</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base">Add New Product</DialogTitle>
                    <DialogDescription className="text-sm">
                      Enter the details for your new agricultural product
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm">Product Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="e.g., Organic Fertilizer"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm">Category</Label>
                      <Select onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
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
                        <Label htmlFor="price" className="text-sm">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          placeholder="0"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock" className="text-sm">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                          placeholder="0"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddProduct} className="w-full text-sm">
                      Add Product
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-600">{product.category}</p>
                      </div>
                      <Badge variant={getStockBadgeVariant(product.status)} className="text-xs">
                        {product.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>₹{product.price}</span>
                      <span className="text-gray-600">Stock: {product.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Business Analytics</CardTitle>
              <CardDescription className="text-sm">Track your business performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Analytics dashboard coming soon...</p>
                <p className="text-xs text-gray-500 mt-2">
                  Connect with Supabase for detailed reporting
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}