'use client';

import { useMemo, useState } from 'react';
import {
  Bookmark,
  AlignLeft,
  CircleChevronDownIcon,
  Trash2,
  Copy,
} from 'lucide-react';
import CustomColumnHeader from './CustomColumnHeader';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  themeAlpine,
  colorSchemeDark,
} from 'ag-grid-community';
import { useIsDarkTheme } from '@/hooks/use-is-dark-theme';
import { DeletionConfirmationPopup } from '@/components/Supplier/DeletionConfirmationPopup';
import { CopyRequestForm } from '@/components/Supplier/CopyRequestForm';
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef: ColDef = {
  sortable: true,
  editable: true,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function PickupRequestTable({
  rowData,
  deleteProductRequest,
}: {
  rowData: any[];
  deleteProductRequest: (_prodId: string) => void;
}) {
  const isDarkTheme = useIsDarkTheme();

  const agGridTheme = useMemo(
    () => (isDarkTheme ? themeAlpine.withPart(colorSchemeDark) : themeAlpine),
    [isDarkTheme]
  );
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCopyRequestForm, setShowCopyRequestForm] = useState(false);
  const [foodId, setFoodId] = useState('');
  const [foodInfo, setFoodInfo] = useState({});

  const confirmDeletion = (prodId: string) => {
    setShowDeleteConfirmation(true);
    setFoodId(prodId);
  };

  const duplicateRequest = (
    prodInfo: {} // eslint-disable-line @typescript-eslint/no-empty-object-type
  ) => {
    setShowCopyRequestForm(true);
    setFoodInfo(prodInfo);
  };

  const columnDefs: ColDef[] = [
    {
      field: 'foodName',
      headerName: 'Food Item',
      editable: false,
      headerComponent: CustomColumnHeader,
      headerComponentParams: { icon: Bookmark },
    },
    {
      field: 'foodType',
      headerName: 'Type',
      editable: false,
      headerComponent: CustomColumnHeader,
      headerComponentParams: { icon: AlignLeft },
    },
    {
      field: 'foodStatus',
      headerName: 'Status',
      editable: false,
      headerComponent: CustomColumnHeader,
      headerComponentParams: { icon: CircleChevronDownIcon },
    },
    {
      field: 'foodClaimer',
      headerName: 'Recipient',
      editable: false,
      headerComponent: CustomColumnHeader,
      headerComponentParams: { icon: AlignLeft },
    },
    {
      headerName: 'Action',
      field: 'foodId',
      headerComponent: CustomColumnHeader,
      headerComponentParams: { icon: AlignLeft },
      editable: false,
      /* eslint-disable @typescript-eslint/no-explicit-any */
      cellRenderer: (params: any) => {
        return (
          <div className='flex gap-4'>
            <div onClick={() => duplicateRequest(params.data.prod)}>
              <button className='flex items-center justify-center gap-1'>
                <Copy className='h-3 w-3' />
                Copy
              </button>
            </div>

            <div onClick={() => confirmDeletion(params.data.foodId)}>
              <button className='flex items-center justify-center gap-1 text-red-400'>
                <Trash2 className='h-3 w-3' />
                Delete
              </button>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className='h-full w-full'>
      <div className='mb-8 rounded-lg bg-white p-6 shadow-sm'>
        <h2 className='mb-6 text-2xl font-semibold text-black'>
          Pickup Request History
        </h2>

        <AgGridReact
          gridOptions={{
            columnDefs,
            defaultColDef,
            domLayout: 'autoHeight',
            editType: 'fullRow',
            pagination: true,
            paginationPageSize: 20,
          }}
          theme={agGridTheme}
          rowData={rowData}
        />
      </div>
      <DeletionConfirmationPopup
        openPopup={showDeleteConfirmation}
        closePopup={() => setShowDeleteConfirmation(false)}
        foodId={foodId}
        deleteProductRequest={deleteProductRequest}
      />
      <CopyRequestForm
        showCopyRequestForm={showCopyRequestForm}
        closeRequestForm={() => setShowCopyRequestForm(false)}
        productInfo={foodInfo}
      />
    </div>
  );
}
