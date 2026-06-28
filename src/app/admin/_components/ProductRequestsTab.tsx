import { ProductRequest } from '../../../../types/types';

interface ProductRequestsTabProps {
  productRequests: ProductRequest[];
  getSupplierName: (_supplierId: string) => string;
  getNonprofitName: (_nonprofitId: string | null) => string;
}

const ProductRequestsTab = ({
  productRequests,
  getSupplierName,
  getNonprofitName,
}: ProductRequestsTabProps) => {
  return (
    <div className='mt-6 space-y-4'>
      <div className='flex items-center'>
        <h2 className='text-2xl font-bold text-foreground dark:text-white'>
          Product Requests
        </h2>
        <div className='ml-4 h-px flex-grow bg-border'></div>
      </div>

      <div className='rounded-lg border border-border bg-card p-6 shadow-md'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-muted/40 text-left'>
                {[
                  'Name',
                  'Unit',
                  'Quantity',
                  'Description',
                  'Status',
                  'Supplier',
                  'Nonprofit',
                ].map((header) => (
                  <th
                    key={header}
                    className='border-b border-border px-6 py-3 text-sm font-medium text-foreground'
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productRequests.map((product, index) => (
                <tr
                  key={product.id}
                  className={`hover:bg-muted/40 ${index % 2 === 0 ? 'bg-card' : '/30 bg-muted/40'}`}
                >
                  <td className='border-b border-border px-6 py-4 text-foreground'>
                    <span className='inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-400'>
                      {product.name}
                    </span>
                  </td>
                  <td className='border-b border-border px-6 py-4 text-foreground'>
                    {product.unit}
                  </td>
                  <td className='border-b border-border px-6 py-4 text-foreground'>
                    {product.quantity}
                  </td>
                  <td className='max-w-xs truncate border-b border-border px-6 py-4 text-foreground'>
                    {product.description}
                  </td>
                  <td className='border-b border-border px-6 py-4'>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        String(product.status) === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                          : String(product.status) === 'RESERVED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
                            : String(product.status) === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                              : 'bg-muted text-foreground'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className='border-b border-border px-6 py-4 text-foreground'>
                    {getSupplierName(product.supplierId)}
                  </td>
                  <td className='border-b border-border px-6 py-4 text-foreground'>
                    {getNonprofitName(product.claimedById)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductRequestsTab;
