import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import type { CheckboxChangeEvent } from "primereact/checkbox";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { LiaChevronDownSolid } from "react-icons/lia";
import { OverlayPanel } from 'primereact/overlaypanel';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const PaginationTable = () => {
    const op = useRef<OverlayPanel>(null);

  const [customers, setCustomers] = useState<Artwork[]>([]);
  const [page, setPage] = useState(0); // PrimeReact uses 0-based page index
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedArtworks, setSelectedArtworks] = useState<number[]>([]);
const [targetSelectionCount, setTargetSelectionCount] = useState<number | null>(null);
const [remainingToSelect, setRemainingToSelect] = useState<number>(0);

  // Fetch data from API
  const fetchData = async (pageNumber: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}&limit=${limit}`
      );
      const data = await response.json();
    
      setCustomers(data.data);
      setTotalRecords(data.pagination.total);
      if (remainingToSelect > 0) {
  const unselected = data.data
    .map((item: Artwork) => item.id)
    .filter((id: number) => !selectedArtworks.includes(id))
    .slice(0, remainingToSelect);

  if (unselected.length > 0) {
    setSelectedArtworks(prev => [...prev, ...unselected]);
    setRemainingToSelect(prev => prev - unselected.length);
  }
}

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const onPageChange = (event: any) => {
    if (event.rows !== rowsPerPage) {
      setRowsPerPage(event.rows);
      setPage(0); 
    } else {
      setPage(event.page);
    }
  };

const onCheckboxChange = (e: CheckboxChangeEvent, artworkId: number) => {
    console.log("Checkbox changed for artwork ID:", artworkId, "Checked:", e.checked);
  setSelectedArtworks((prevSelected) =>
    !prevSelected.includes(artworkId)
      ? [...prevSelected, artworkId]
      : prevSelected.filter((id) => id !== artworkId)
  );
};
  console.log(selectedArtworks)

  const checkboxBodyTemplate = (rowData: Artwork) => {

    
    return (
      <Checkbox
        inputId={`cb-${rowData.id}`}
        checked={selectedArtworks.includes(rowData.id)}
        onChange={(e) => onCheckboxChange(e, rowData.id)}
      />
    );
  };

  // Handle "select all" checkbox in header
  const onHeaderCheckboxChange = (e: CheckboxChangeEvent) => {
    const currentPageIds = customers.map((art) => art.id);
    if (e.checked) {
      const newSelection = Array.from(new Set([...selectedArtworks, ...currentPageIds]));
      setSelectedArtworks(newSelection);
    } else {
      const filtered = selectedArtworks.filter((id) => !currentPageIds.includes(id));
      setSelectedArtworks(filtered);
    }
  };

  // Render header checkbox
  const headerCheckboxTemplate = () => {
    const allSelected = customers.length > 0 && customers.every((art) =>
      selectedArtworks.includes(art.id)
    );
    
    return (
      <Checkbox
        checked={allSelected}
        onChange={onHeaderCheckboxChange}
      />
    );
  };

  return (
    <div className="p-4">
      <h2 className="mb-3">Artworks Table</h2>
      <DataTable
        value={customers}
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        lazy
        loading={loading}
        onPage={onPageChange}
        rowsPerPageOptions={[3, 5, 10, 15, 30]}
        tableStyle={{ minWidth: "50rem" }}
      >
 <Column
  header={() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {headerCheckboxTemplate()}
      <LiaChevronDownSolid
        style={{ cursor: 'pointer' }}
        onClick={(e) => op.current?.toggle(e)}
      />
      <OverlayPanel ref={op}>
<input
  type="number"
  placeholder="Select rows"
  onChange={(e) => setTargetSelectionCount(Number(e.target.value))}
/><br/>
<button
  type="submit"
  onClick={() => {
    if (!targetSelectionCount) return;

    const unselectedCurrentPage = customers
      .map((art) => art.id)
      .filter((id) => !selectedArtworks.includes(id))
      .slice(0, targetSelectionCount);

    setSelectedArtworks((prev) => [...prev, ...unselectedCurrentPage]);
    setRemainingToSelect(targetSelectionCount - unselectedCurrentPage.length);
    op.current?.hide();
  }}
>
  Select
</button>
      </OverlayPanel>
    </div>
  )}
  body={checkboxBodyTemplate}
  style={{ width: '3rem' }}
  headerStyle={{ width: '3rem' }}
/>
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist Display" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      <div className="mt-4">
        <h4>Selected Artwork IDs:</h4>
        <pre>{JSON.stringify(selectedArtworks, null, 2)}</pre>
        <h4>Selected Artwork Count: {selectedArtworks.length}</h4>
      </div>
    </div>
  );
};

export default PaginationTable;
