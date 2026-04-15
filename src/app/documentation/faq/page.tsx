export default function FAQPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-4xl font-bold text-foreground'>
        Frequently Asked Questions and Troubleshooting
      </h1>

      <div className='space-y-8'>
        <section className='space-y-4'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium italic text-foreground'>
                Q: Can I use any email to register with the MAFC platform?
              </h3>
              <p className='leading-relaxed text-foreground/80'>
                A: No, at this moment we only allow existing GMAIL users to
                register.
              </p>
            </div>

            <div className='space-y-2'>
              <h3 className='text-lg font-medium italic text-foreground'>
                Q: What file format is required for nonprofit verification?
              </h3>
              <p className='leading-relaxed text-foreground/80'>
                A: A 501(c)(3) document under 1MB in size, in any of the
                following formats: PDF, PNG, JPG, JPEG.
              </p>
            </div>

            <div className='space-y-2'>
              <h3 className='text-lg font-medium italic text-foreground'>
                Q: Can I change my role after registration?
              </h3>
              <p className='leading-relaxed text-foreground/80'>
                A: No, you select your role once during onboarding. To access a
                different role, please register with another Gmail account.
              </p>
            </div>

            <div className='space-y-2'>
              <h3 className='text-lg font-medium italic text-foreground'>
                Q: I didn&#39;t receive my notification email. What should I do?
              </h3>
              <p className='leading-relaxed text-foreground/80'>
                A: Check your spam or junk folder. If it&#39;s not there, please
                contact platform support
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
