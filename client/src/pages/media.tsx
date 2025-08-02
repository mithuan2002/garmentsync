import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Image, Upload, Download, Trash2, Eye, Search, Filter, Package, Calendar } from "lucide-react";

interface MediaFile {
  id: string;
  orderId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'product_photos' | 'technical_drawings' | 'specifications' | 'samples' | 'other';
  description?: string;
}

interface Order {
  id: string;
  buyerName: string;
  styleNumber: string;
  status: string;
}

export default function Media() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingOrderId, setUploadingOrderId] = useState("");
  const [uploadCategory, setUploadCategory] = useState<string>("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterOrder, setFilterOrder] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ["/api/media"],
    queryFn: async () => {
      const response = await fetch("/api/media");
      if (!response.ok) throw new Error("Failed to fetch media files");
      return response.json();
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload files");
      return response.json();
    },
    onSuccess: () => {
      setSelectedFiles([]);
      setUploadingOrderId("");
      setUploadCategory("");
      setUploadDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Upload Successful",
        description: "Files have been uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("DELETE", `/api/media/${fileId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "File Deleted",
        description: "File has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0 || !uploadingOrderId || !uploadCategory) {
      toast({
        title: "Missing Information",
        description: "Please select files, order, and category.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("orderId", uploadingOrderId);
    formData.append("category", uploadCategory);
    if (uploadDescription) {
      formData.append("description", uploadDescription);
    }

    uploadMutation.mutate(formData);
  };

  const filteredFiles = mediaFiles.filter((file: MediaFile) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || file.category === filterCategory;
    const matchesOrder = filterOrder === "all" || file.orderId === filterOrder;
    
    return matchesSearch && matchesCategory && matchesOrder;
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'product_photos':
        return "bg-blue-100 text-blue-700";
      case 'technical_drawings':
        return "bg-purple-100 text-purple-700";
      case 'specifications':
        return "bg-green-100 text-green-700";
      case 'samples':
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Media Library</h1>
          <p className="text-slate-600 mt-1">Store and manage product media files</p>
        </div>
        <Badge variant="secondary">
          {mediaFiles.length} files
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select Files</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                className="cursor-pointer"
              />
              {selectedFiles.length > 0 && (
                <p className="text-sm text-slate-600 mt-1">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>

            <div>
              <Label>Order</Label>
              <Select value={uploadingOrderId} onValueChange={setUploadingOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order: Order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.buyerName} ({order.styleNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_photos">Product Photos</SelectItem>
                  <SelectItem value="technical_drawings">Technical Drawings</SelectItem>
                  <SelectItem value="specifications">Specifications</SelectItem>
                  <SelectItem value="samples">Samples</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || !uploadingOrderId || !uploadCategory || uploadMutation.isPending}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
            </Button>
          </CardContent>
        </Card>

        {/* Files List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="w-5 h-5" />
              <span>Media Files</span>
            </CardTitle>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="product_photos">Product Photos</SelectItem>
                  <SelectItem value="technical_drawings">Technical Drawings</SelectItem>
                  <SelectItem value="specifications">Specifications</SelectItem>
                  <SelectItem value="samples">Samples</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterOrder} onValueChange={setFilterOrder}>
                <SelectTrigger className="w-48">
                  <Package className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  {orders.map((order: Order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.styleNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading media files...</div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Image className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No media files found</p>
                {searchQuery || filterCategory !== "all" || filterOrder !== "all" ? (
                  <p className="text-sm mt-2">Try adjusting your filters</p>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFiles.map((file: MediaFile) => (
                  <div key={file.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {file.mimeType.startsWith('image/') ? (
                          <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                            <Image className="w-6 h-6 text-slate-500" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-500" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">{file.originalName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                            <span>Order: {file.orderId}</span>
                            <Badge variant="secondary" className={`text-xs ${getCategoryColor(file.category)}`}>
                              {file.category.replace('_', ' ')}
                            </Badge>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                          {file.description && (
                            <p className="text-sm text-slate-600 mt-1 truncate">{file.description}</p>
                          )}
                          <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Uploaded {formatDateTime(file.uploadedAt)} by {file.uploadedBy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.originalName;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(file.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}