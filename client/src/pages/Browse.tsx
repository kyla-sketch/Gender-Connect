import { useState } from "react";
import { useAuth } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mockData";
import { Heart, MapPin, Briefcase, Filter, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Browse() {
  const { currentUser } = useAuth();
  
  // Filter state
  const [ageRange, setAgeRange] = useState([18, 50]);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  
  if (!currentUser) return null;

  // Filter Logic:
  // 1. Filter by opposite gender
  // 2. Filter by age range
  // 3. Filter by location
  const filteredUsers = MOCK_USERS.filter(user => {
    // Gender Filter (Strict)
    if (currentUser.gender === 'male' && user.gender !== 'female') return false;
    if (currentUser.gender === 'female' && user.gender !== 'male') return false;
    
    // Self Filter (redundant due to gender check usually, but good practice)
    if (user.id === currentUser.id) return false;

    // Age Filter
    if (user.age < ageRange[0] || user.age > ageRange[1]) return false;

    // Location Filter
    if (locationFilter !== "all" && !user.location.includes(locationFilter)) return false;

    return true;
  });

  const uniqueLocations = Array.from(new Set(MOCK_USERS.map(u => u.location.split(', ')[1]).filter(Boolean)));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Discover</h1>
          <p className="text-muted-foreground">Find people nearby who match your interests.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full h-10 px-6 border-gray-300 hover:border-primary hover:text-primary transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Filters</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Age Range</Label>
                  <span className="text-sm text-muted-foreground">{ageRange[0]} - {ageRange[1]}</span>
                </div>
                <Slider 
                  min={18} 
                  max={60} 
                  step={1} 
                  value={ageRange} 
                  onValueChange={setAgeRange} 
                  className="py-4"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <select 
                  className="w-full p-2 rounded-md border border-gray-200 bg-white"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">Anywhere</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
               <Button onClick={() => {}} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-muted-foreground">No profiles found matching your filters.</p>
          <Button 
            variant="link" 
            onClick={() => { setAgeRange([18, 60]); setLocationFilter("all"); }}
            className="text-primary mt-2"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-2xl font-serif font-bold">{user.name}, {user.age}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/90 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.location}
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                   <div className="flex flex-wrap gap-2 mb-4">
                     {user.interests.slice(0, 3).map(interest => (
                       <span key={interest} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                         {interest}
                       </span>
                     ))}
                   </div>
                   <p className="text-sm text-gray-500 line-clamp-2 mb-4">{user.bio}</p>
                   
                   <div className="flex gap-2">
                      <Button className="flex-1 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100 border-none shadow-none font-medium">
                        View Profile
                      </Button>
                      <Button size="icon" className="rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                        <Heart className="w-5 h-5" />
                      </Button>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
