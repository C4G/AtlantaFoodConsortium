'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClaimSuccessPopup } from '@/components/Nonprofit/ClaimSuccessPopup';
import { ClaimedItemDetailsPopup } from '@/components/Nonprofit/ClaimedItemDetailsPopup';

interface Nonprofit {
  id: string;
  name: string;
  organizationType: string;
  productsClaimed: Array<{
    id: string;
    name: string;
    quantity: number;
    status: string;
    productType: {
      id: string;
      protein: boolean;
      produce: boolean;
      shelfStable: boolean;
    };
    pickupInfo: {
      pickupDate: string;
      pickupLocation: string;
    };
  }>;
  nonprofitDocumentApproval?: boolean | null;
}

interface ExtendedUser {
  nonprofitId?: string;
  productSurveyId?: string;
  role?: string;
}

interface ProductInterest {
  id: string;
  protein: boolean;
  proteinTypes: string[];
  produce: boolean;
  produceType: string;
  shelfStable: boolean;
  shelfStableType: string;
  shelfStableIndividualServing: boolean;
  shelfStableIndividualServingType: string;
  alreadyPreparedFood: boolean;
  alreadyPreparedFoodType: string;
  other: boolean;
  otherType: string;
}

interface ProductRequest {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  description: string;
  status: string;
  perishable: boolean;
  expirationDate?: string;
  createdAt: string;
  productType: {
    id: string;
    protein: boolean;
    proteinTypes: string[];
    produce: boolean;
    produceType: string;
    shelfStable: boolean;
    shelfStableType: string;
  };
  supplier: {
    id: string;
    name: string;
  };
  pickupInfo: {
    pickupDate: string;
    pickupLocation: string;
    pickupTimeframe: string[];
    contactName: string;
    contactPhone: string;
    pickupInstructions: string;
  };
}

export default function NonprofitDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showItemDetailPopup, setShowItemDetailPopup] = useState(false);
  const [claimedItem, setClaimedItem] = useState({});
  const [nonprofit, setNonprofit] = useState<Nonprofit | null>(null);
  const [productInterests, setProductInterests] =
    useState<ProductInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableProducts, setAvailableProducts] = useState<ProductRequest[]>(
    []
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const showItemDetails = (
    event: React.MouseEvent<HTMLDivElement>,
    product: any
  ) => {
    setShowItemDetailPopup(true);
    setClaimedItem(product);
    const element = event.target as HTMLElement;
    element.classList.add('scale-75');
    setTimeout(() => {
      element.classList.remove('scale-75');
    }, 200);
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const handleClaimProduct = async (productId: string) => {
    try {
      const response = await fetch('/api/item-availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim product');
      }

      const claimedProduct = await response.json();

      // Send product claimed email to supplier
      try {
        const emailResponse = await fetch(
          '/api/product-request-claimed-emails',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
          }
        );

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Failed to send product claimed email:', errorText);
          // Continue with claim success since email is secondary
        }
      } catch (error) {
        console.error('Error sending product claimed email:', error);
        // Continue with claim success since email is secondary
      }

      // Update the available products list by removing the claimed product
      setAvailableProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );

      // Update the nonprofit's claimed products list
      if (nonprofit) {
        setNonprofit((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            productsClaimed: [
              ...prev.productsClaimed,
              {
                id: claimedProduct.id,
                name: claimedProduct.name,
                quantity: claimedProduct.quantity,
                status: claimedProduct.status,
                productType: claimedProduct.productType,
                pickupInfo: claimedProduct.pickupInfo,
              },
            ],
          };
        });
      }

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUnclaimProduct = async (
    productId: string,
    pickupDate: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    //if the date is in the past don't proceed with unclaiming
    const productPickupDate = new Date(pickupDate);
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    if (productPickupDate < todaysDate) {
      alert(
        'You can no longer unclaim this food pick-up request because the date has passed'
      );
      const element = event.target as HTMLButtonElement;
      element.disabled = true;
      element.classList.add('bg-slate-500');
      element.classList.remove('hover:bg-red-700');
    } else {
      try {
        const response = await fetch('/api/item-availability', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            action: 'unclaim',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to unclaim product');
        }

        const unclaimedProduct = await response.json();

        // Remove from claimed products
        setNonprofit((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            productsClaimed: prev.productsClaimed.filter(
              (product) => product.id !== productId
            ),
          };
        });

        // Add back to available products
        setAvailableProducts((prev) => [...prev, unclaimedProduct]);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleDocumentReupload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/nonprofit-documents', {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      // Update the local state to show pending status
      setNonprofit((prev) =>
        prev
          ? {
              ...prev,
              nonprofitDocumentApproval: null,
            }
          : null
      );

      alert('Document uploaded successfully. Pending approval.');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to upload document. Please try again.'
      );
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.replace('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Try to get a fresh session
        const response = await fetch('/api/auth/session');
        const freshSession = await response.json();
        const userNonprofitId = (freshSession.user as ExtendedUser).nonprofitId;

        if (!userNonprofitId) {
          throw new Error('No nonprofit ID found');
        }

        const nonprofitResponse = await fetch(
          `/api/nonprofits?nonprofitId=${userNonprofitId}`
        );
        if (!nonprofitResponse.ok) {
          throw new Error('Failed to fetch nonprofit data');
        }

        const nonprofitData = await nonprofitResponse.json();
        setNonprofit(nonprofitData);

        // Fetch product interests
        const productSurveyId = (freshSession.user as ExtendedUser)
          .productSurveyId;
        if (productSurveyId) {
          const interestsResponse = await fetch(
            `/api/non-profit-interests?productSurveyId=${productSurveyId}`
          );
          if (!interestsResponse.ok) {
            throw new Error('Failed to fetch nonprofit interests');
          }
          const interestsData = await interestsResponse.json();
          setProductInterests(interestsData);
        }

        // Fetch available products
        const productsResponse = await fetch(
          '/api/item-availability?status=AVAILABLE'
        );
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch available products');
        }
        const productsData = await productsResponse.json();
        setAvailableProducts(productsData);
      } catch (error) {
        console.error('Error:', error);
        setNonprofit(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
        <div className='w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg'>
          <p className='text-center text-lg text-slate-700'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!nonprofit) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
        <div className='w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg'>
          <p className='text-center text-lg text-red-600'>
            Error loading nonprofit data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 p-8'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Organization Header */}
        <div className='rounded-xl bg-white p-6 shadow-lg'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='mb-2 text-3xl font-bold text-blue-600'>
                {nonprofit.name}
              </h1>
              <p className='text-lg text-slate-700'>
                {nonprofit.organizationType
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </p>
            </div>

            {/* Right side status section */}
            <div className='text-right'>
              {nonprofit.nonprofitDocumentApproval === true ? (
                <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800'>
                  Approved
                </span>
              ) : (
                <>
                  <input
                    type='file'
                    id='documentUpload'
                    className='hidden'
                    accept='.pdf,.png,.jpg,.jpeg'
                    onChange={handleDocumentReupload}
                  />
                  <label
                    htmlFor='documentUpload'
                    className='mb-2 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  >
                    Reupload Document
                  </label>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        nonprofit.nonprofitDocumentApproval === null
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Status:{' '}
                      {nonprofit.nonprofitDocumentApproval === null
                        ? 'Pending'
                        : 'Rejected'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Interests Section */}
        <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-lg'>
          <h2 className='mb-4 text-xl font-semibold text-slate-800'>
            Your Product Interests
          </h2>
          {productInterests ? (
            <div className='grid gap-4 md:grid-cols-2'>
              {productInterests.protein && (
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <h3 className='font-semibold text-slate-800'>Protein</h3>
                  <p className='text-slate-700'>
                    Types: {productInterests.proteinTypes.join(', ')}
                  </p>
                </div>
              )}
              {productInterests.produce && (
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <h3 className='font-semibold text-slate-800'>Produce</h3>
                  <p className='text-slate-700'>
                    Type: {productInterests.produceType}
                  </p>
                </div>
              )}
              {productInterests.shelfStable && (
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <h3 className='font-semibold text-slate-800'>Shelf Stable</h3>
                  <p className='text-slate-700'>
                    Type: {productInterests.shelfStableType}
                  </p>
                </div>
              )}
              {productInterests.shelfStableIndividualServing && (
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <h3 className='font-semibold text-slate-800'>
                    Individual Shelf Stable
                  </h3>
                  <p className='text-slate-700'>
                    Type: {productInterests.shelfStableIndividualServingType}
                  </p>
                </div>
              )}
              {productInterests.alreadyPreparedFood && (
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <h3 className='font-semibold text-slate-800'>
                    Prepared Food
                  </h3>
                  <p className='text-slate-700'>
                    Type: {productInterests.alreadyPreparedFoodType}
                  </p>
                </div>
              )}
              {productInterests.other && (
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                  <h3 className='font-semibold text-slate-800'>Other</h3>
                  <p className='text-slate-700'>
                    Type: {productInterests.otherType}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className='text-center text-slate-500'>
              No product interests found
            </p>
          )}
        </div>

        {/* Claimed Products Section */}
        <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-lg'>
          <h2 className='mb-4 text-xl font-semibold text-slate-800'>
            Claimed Products
          </h2>
          {nonprofit.productsClaimed.length > 0 ? (
            <div className='grid gap-4 md:grid-cols-2'>
              {nonprofit.productsClaimed.map((product) => (
                <div
                  key={product.id}
                  className='cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-md'
                  onClick={(e) => showItemDetails(e, product)}
                >
                  <h3 className='font-semibold text-slate-800'>
                    {product.name}
                  </h3>
                  <div className='mt-2 space-y-1'>
                    <p className='text-slate-700'>
                      Quantity: {product.quantity}
                    </p>
                    <p className='text-slate-700'>Status: {product.status}</p>
                    <p className='text-slate-700'>
                      Pickup Date:{' '}
                      {new Date(
                        product.pickupInfo.pickupDate
                      ).toLocaleDateString()}
                    </p>
                    <p className='text-slate-700'>
                      Location: {product.pickupInfo.pickupLocation}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnclaimProduct(
                        product.id,
                        product.pickupInfo.pickupDate,
                        e
                      );
                    }}
                    className='mt-4 rounded-md bg-red-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  >
                    Unclaim Product
                  </button>
                </div>
              ))}
              {showItemDetailPopup && (
                <ClaimedItemDetailsPopup
                  showDetailsPopup={showItemDetailPopup}
                  closeDetailsPopup={() => setShowItemDetailPopup(false)}
                  claimedItem={claimedItem}
                />
              )}
            </div>
          ) : (
            <p className='text-center text-slate-500'>
              No products claimed yet
            </p>
          )}
        </div>

        {/* Available Products Section */}
        <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-lg'>
          <h2 className='mb-4 text-xl font-semibold text-slate-800'>
            Available Products
          </h2>
          {availableProducts.length > 0 ? (
            <div className='space-y-4'>
              {availableProducts.map((product) => (
                <div
                  key={product.id}
                  className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'
                >
                  <div className='flex justify-between'>
                    <h3 className='text-lg font-semibold text-slate-800'>
                      {product.name}
                    </h3>
                    <span className='text-sm text-slate-500'>
                      Posted {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className='mt-4 grid gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <p className='text-slate-700'>
                        <span className='font-medium text-slate-800'>
                          Quantity:
                        </span>{' '}
                        {product.quantity} {product.unit}
                      </p>
                      <p className='text-slate-700'>
                        <span className='font-medium text-slate-800'>
                          Description:
                        </span>{' '}
                        {product.description}
                      </p>
                      {product.perishable && product.expirationDate && (
                        <p className='text-slate-700'>
                          <span className='font-medium text-slate-800'>
                            Expires:
                          </span>{' '}
                          {new Date(
                            product.expirationDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                      <p className='text-slate-700'>
                        <span className='font-medium text-slate-800'>
                          Status:
                        </span>{' '}
                        {product.status}
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-slate-700'>
                        <span className='font-medium text-slate-800'>
                          Supplier:
                        </span>{' '}
                        {product.supplier.name}
                      </p>
                      <p className='text-slate-700'>
                        <span className='font-medium text-slate-800'>
                          Pickup Location:
                        </span>{' '}
                        {product.pickupInfo.pickupLocation}
                      </p>
                      <p className='text-slate-700'>
                        <span className='font-medium text-slate-800'>
                          Pickup Date:
                        </span>{' '}
                        {new Date(
                          product.pickupInfo.pickupDate
                        ).toLocaleDateString()}
                      </p>
                      <p className='text-slate-700'>
                        <span className='font-medium text-slate-800'>
                          Pickup Time:
                        </span>{' '}
                        {product.pickupInfo.pickupTimeframe
                          .map((time) => time.replace(/_/g, ' '))
                          .join(', ')}
                      </p>
                      <p className='text-slate-700'>
                        <span className='font-medium text-slate-800'>
                          Instructions:
                        </span>{' '}
                        {product.pickupInfo.pickupInstructions}
                      </p>
                    </div>
                  </div>

                  {nonprofit.nonprofitDocumentApproval === true ? (
                    <button
                      onClick={() => handleClaimProduct(product.id)}
                      className='mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    >
                      Claim This Product
                    </button>
                  ) : (
                    <div className='mt-4 flex flex-col gap-2'>
                      <button
                        disabled
                        className='cursor-not-allowed rounded-md bg-slate-300 px-4 py-2 font-medium text-slate-500'
                      >
                        Claim This Product
                      </button>
                      <p className='text-sm text-red-600'>
                        {nonprofit.nonprofitDocumentApproval === null
                          ? 'Document approval pending. You can claim products once approved.'
                          : 'Document rejected. Please reupload your document for approval.'}
                      </p>
                    </div>
                  )}
                  <ClaimSuccessPopup
                    openPopup={showSuccessMessage}
                    closePopup={() => setShowSuccessMessage(false)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className='text-center text-slate-500'>
              No available products found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
