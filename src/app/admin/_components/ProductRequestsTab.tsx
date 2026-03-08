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
        <h2 className='text-2xl font-bold text-slate-800'>Product Requests</h2>
        <div className='ml-4 h-px flex-grow bg-slate-200'></div>
      </div>

      <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-slate-50 text-left'>
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
                    className='border-b border-slate-200 px-6 py-3 text-sm font-medium text-slate-700'
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
                  className={`hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                    <span className='inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800'>
                      {product.name}
                    </span>
                  </td>
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                    {product.unit}
                  </td>
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                    {product.quantity}
                  </td>
                  <td className='max-w-xs truncate border-b border-slate-200 px-6 py-4 text-slate-800'>
                    {product.description}
                  </td>
                  <td className='border-b border-slate-200 px-6 py-4'>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        String(product.status) === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : String(product.status) === 'RESERVED'
                            ? 'bg-blue-100 text-blue-800'
                            : String(product.status) === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                    {getSupplierName(product.supplierId)}
                  </td>
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
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
