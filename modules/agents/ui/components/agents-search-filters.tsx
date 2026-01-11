import { SearchIcon } from "lucide-react";
import { useAgentsFilter } from "../../hooks/use-agents-filter";
import { Input } from "@/components/ui/input";

export const AgentsSearchFilter = () => {
    const [filters, setFilters] = useAgentsFilter();
    return (
        <div className="relative">
            <Input
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="h-9 bg-white w-[200px] pl-7"
                placeholder="Search Agents..."
            />
            <SearchIcon className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
        </div>
    )
}