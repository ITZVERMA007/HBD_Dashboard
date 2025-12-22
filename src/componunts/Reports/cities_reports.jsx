import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Typography,
  Input,
  Spinner,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { listingData } from "@/data/listingJSON"; 
import * as XLSX from "xlsx/dist/xlsx.full.min.js";

const defaultColumns = [
  { key: "name", label: "Name", width: 220 },
  { key: "address", label: "Address", width: 320 },
  { key: "website", label: "Website", width: 180 },
  { key: "phone_number", label: "Contact", width: 140 },
  { key: "reviews_count", label: "Review Count", width: 120 },
  { key: "reviews_average", label: "Review Avg", width: 120 },
  { key: "category", label: "Category", width: 140 },
  { key: "city", label: "City", width: 140 },
  { key: "state", label: "State", width: 140 },
];

export function CitiesReports() {
  const [loading, setLoading] = useState(true);
  const [fullData, setFullData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Initializing with empty string is crucial
  const [selectedCity, setSelectedCity] = useState(""); 
  const [categorySearch, setCategorySearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFullData(listingData);
      setTotal(listingData.length);
      setLoading(false);
    }, 300);
  }, []);

  // 1. STRICT DATA CLEANING: Trim spaces to ensure exact matches
  const uniqueCities = useMemo(() => {
    if (!fullData.length) return [];
    const cities = [
      ...new Set(
        fullData.map((item) => String(item.city || "").trim()).filter(Boolean)
      ),
    ];
    return cities.sort();
  }, [fullData]);

  // 2. FILTER LOGIC
  const filteredData = useMemo(() => {
    let data = [...fullData];
    
    // Normalize values for comparison
    const normalize = (val) => String(val || "").toLowerCase().trim();
    const targetCity = normalize(selectedCity);

    if (targetCity) {
      data = data.filter((x) => normalize(x.city) === targetCity);
    }

    if (categorySearch) {
      const s = normalize(categorySearch);
      data = data.filter((x) => normalize(x.category).includes(s));
    }

    return data;
  }, [fullData, selectedCity, categorySearch]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const A = String(a[sortField] ?? "").toLowerCase();
      const B = String(b[sortField] ?? "").toLowerCase();
      if (A === B) return 0;
      return sortOrder === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });
  }, [filteredData, sortField, sortOrder]);

  useEffect(() => {
    const start = (currentPage - 1) * limit;
    setPageData(sortedData.slice(start, start + limit));
    setTotal(sortedData.length);
  }, [sortedData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, categorySearch]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen mt-8 mb-12 px-4 rounded bg-[#F8FAFC] text-blue-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-blue-gray-900">
            Cities Data
          </Typography>
          <Typography variant="small" className="font-normal text-gray-500">
            Filter listings by specific cities
          </Typography>
        </div>
      </div>

      <Card className="h-full w-full border border-gray-200 shadow-sm overflow-visible">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between m-5 overflow-visible">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto overflow-visible">
              
              {/* FIXED SELECT COMPONENT */}
              <div className="w-full sm:w-72">
              
                {!loading && uniqueCities.length > 0 ? (
                  <Select
                    label="Select City"
                   
                    value={selectedCity} 
                    onChange={(val) => setSelectedCity(val)}
                    className="bg-white"
                    containerProps={{ className: "min-w-[100px]" }}
                    
                    key={`city-select-${selectedCity || 'empty'}`} 
                  >
                      {uniqueCities.map((city) => (
                        <Option key={city} value={city}>
                          {city}
                        </Option>
                      ))}
                  </Select>
                ) : (
                   /* Placeholder while loading */
                   <div className="w-full h-10 border border-gray-200 rounded-lg bg-gray-50 flex items-center px-3 text-gray-400 text-sm">
                      Loading cities...
                   </div>
                )}
                
                {/* Clear Filter Button (Only shows when a city is selected) */}
                {selectedCity && (
                   <div 
                     className="text-xs text-blue-600 font-bold cursor-pointer mt-1 text-right"
                     onClick={() => setSelectedCity("")}
                   >
                     Clear Filter
                   </div>
                )}
              </div>

              <div className="w-full sm:w-72">
                <Input
                  label="Search Category..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2 items-center text-sm font-medium text-gray-600">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex gap-1">
                <Button
                    size="sm"
                    variant="text"
                    className="p-2 rounded-full hover:bg-gray-200"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                >
                    <ChevronDownIcon className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                    size="sm"
                    variant="text"
                    className="p-2 rounded-full hover:bg-gray-200"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                >
                    <ChevronDownIcon className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </div>

        <CardBody className="p-0 overflow-x-auto relative z-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-12 w-12 text-gray-900" />
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse min-w-[1200px] text-left">
              <thead className="sticky top-0 z-20 border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  {defaultColumns.map((col) => (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleSort(col.key)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{col.label}</span>
                        <ChevronUpDownIcon className="h-4 w-4" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-sm text-gray-700">
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={defaultColumns.length} className="text-center py-10 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  pageData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {defaultColumns.map((col) => (
                        <td key={col.key} className="px-4 py-3 break-words align-top">
                          {String(row[col.key] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default CitiesReports;