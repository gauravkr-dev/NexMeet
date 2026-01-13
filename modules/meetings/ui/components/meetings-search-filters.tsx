import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMeetingsFilter } from "../../hooks/use-meetings-filter";

export const MeetingsSearchFilter = () => {
    const [filters, setFilters] = useMeetingsFilter();
    return (
        <div className="relative">
            <Input
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                className="h-9 bg-white w-[200px] pl-7"
                placeholder="Search meetings..."
            />
            <SearchIcon className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
        </div>
    )
}