import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FeaturedImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

const FeaturedImageUpload = ({ value, onChange }: FeaturedImageUploadProps) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `featured/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("post-images").getPublicUrl(path);
    onChange(publicUrl);
    setUploading(false);
  }, [onChange, toast]);

  return (
    <div className="space-y-2">
      <Label>Featured Image</Label>
      {value ? (
        <div className="relative rounded-md overflow-hidden border">
          <img src={value} alt="Featured" className="w-full h-48 object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload featured image</p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
    </div>
  );
};

export default FeaturedImageUpload;
