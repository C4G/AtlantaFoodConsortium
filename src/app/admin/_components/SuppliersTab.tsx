import { Supplier } from '../../../../types/types';

interface SuppliersTabProps {
  suppliers: Supplier[];
}

const SuppliersTab = ({ suppliers }: SuppliersTabProps) => {
  const activeSuppliers = suppliers.filter((s) => s.users.length > 0);

  return (
    <div className='mt-6 space-y-4'>
      <div className='flex items-center'>
        <h2 className='text-2xl font-bold capitalize text-slate-800'>
          Suppliers
        </h2>
        <div className='ml-4 h-px flex-grow bg-slate-200'></div>
      </div>

      <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-slate-50 text-left'>
                {['Supplier Name', 'Phone', 'Email', 'Cadence'].map(
                  (header) => (
                    <th
                      key={header}
                      className='border-b border-slate-200 px-6 py-3 text-sm font-medium text-slate-700'
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {activeSuppliers.map((supplier, index) => (
                <tr
                  key={supplier.id}
                  className={`hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                    {supplier.name}
                  </td>
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                    {supplier.users[0]?.phoneNumber || 'N/A'}
                  </td>
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                    {supplier.users[0]?.email || 'N/A'}
                  </td>
                  <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                    {supplier.cadence}
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

export default SuppliersTab;
