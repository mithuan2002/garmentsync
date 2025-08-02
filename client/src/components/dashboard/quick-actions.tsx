import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, UserPlus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const { toast } = useToast();

  const handleNewProject = () => {
    toast({
      title: "Project Created",
      description: "New project has been created successfully.",
    });
  };

  const handleUploadFile = () => {
    toast({
      title: "File Upload",
      description: "File upload functionality coming soon.",
    });
  };

  const handleInviteUser = () => {
    toast({
      title: "Invitation Sent",
      description: "Team member invitation has been sent.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export is being prepared.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <Button 
          className="w-full" 
          onClick={handleNewProject}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Project
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleUploadFile}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleInviteUser}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Team Member
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleExportData}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </CardContent>
    </Card>
  );
}
