import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export default function HomePage() {
  return (
    <SEO
      title="One Link to Share Everything"
      description="Share your links, files, and drops with one simple link. No more messy bios or multiple links."
    >
      <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">HomePage</h1>
        <p className="mb-8">This is the homepage placeholder. Sections will be added here.</p>
        
        {/* Design System Test Section */}
        <div className="space-y-6 p-8 border border-border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold">Design System Verification</h2>
          
          {/* Theme Toggle Test */}
          <div className="flex items-center gap-4">
            <span>Theme Toggle:</span>
            <ThemeToggleButton />
          </div>
          
          {/* Button Variants Test */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Button Variants:</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          
          {/* Purple Gradient Test */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Purple Gradient Classes:</h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold">
                Purple Gradient Button
              </button>
              <h4 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Purple Gradient Text
              </h4>
            </div>
          </div>
          
          {/* CSS Variables Test */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium">CSS Variables:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary text-primary-foreground rounded">
                Primary Background
              </div>
              <div className="p-4 bg-secondary text-secondary-foreground rounded">
                Secondary Background
              </div>
              <div className="p-4 bg-muted text-muted-foreground rounded">
                Muted Background
              </div>
              <div className="p-4 bg-accent text-accent-foreground rounded">
                Accent Background
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </SEO>
  );
}
