import { useState } from "react";
import { Button } from "@/components/ui/button";

interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  date: string;
}

export const InstagramFeed = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([
    // Mock data - Bu gerçek Instagram API'si ile değiştirilecek
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `post-${i + 1}`,
      image: `/placeholder.svg`,
      caption: `Instagram paylaşımı ${i + 1}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')
    }))
  ]);
  
  const [displayCount, setDisplayCount] = useState(20);

  const loadMorePosts = () => {
    // Mock: Daha fazla post yükle
    const newPosts = Array.from({ length: 10 }, (_, i) => ({
      id: `post-${posts.length + i + 1}`,
      image: `/placeholder.svg`,
      caption: `Instagram paylaşımı ${posts.length + i + 1}`,
      date: new Date(Date.now() - (posts.length + i) * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')
    }));
    
    setPosts([...posts, ...newPosts]);
    setDisplayCount(displayCount + 10);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Instagram Paylaşımları</h2>
        <p className="text-muted-foreground">En son paylaşımlarımızı görün</p>
      </div>
      
      {/* Instagram tarzı dikey liste */}
      <div className="space-y-6 max-w-md mx-auto">
        {posts.slice(0, displayCount).map((post) => (
          <div key={post.id} className="bg-card rounded-xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="flex items-center p-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full mr-3"></div>
              <div>
                <h4 className="font-semibold text-sm">@sirketadi</h4>
                <p className="text-xs text-muted-foreground">{post.date}</p>
              </div>
            </div>
            
            {/* Image */}
            <div className="aspect-square bg-muted">
              <img 
                src={post.image} 
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Caption */}
            <div className="p-4">
              <p className="text-sm">{post.caption}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Load More Button */}
      <div className="text-center">
        <Button 
          onClick={loadMorePosts}
          variant="outline"
          className="btn-mobile"
        >
          Daha Fazla Yükle
        </Button>
      </div>
    </div>
  );
};