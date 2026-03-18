export default function OverviewPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-4xl font-bold text-foreground'>What is MAFC?</h1>

      <div className='space-y-8'>
        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Platform Overview
          </h2>
          <p className='leading-relaxed text-foreground/80'>
            The Metro Atlanta Food Consortium (MAFC) is a digital platform that
            connects food suppliers with nonprofit organizations in the Atlanta
            metropolitan area. Our mission is to reduce food waste and ensure
            that surplus food reaches those who need it most.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Our Mission
          </h2>
          <p className='leading-relaxed text-foreground/80'>
            MAFC bridges the gap between businesses with excess food inventory
            and nonprofits serving communities in need. By facilitating the
            donation and redistribution of surplus food, we help combat food
            insecurity while reducing environmental impact through decreased
            food waste.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            How It Works
          </h2>
          <ul className='list-inside list-disc space-y-2 text-foreground/80'>
            <li>
              <strong className='text-foreground'>Suppliers</strong> post
              available food products they wish to donate
            </li>
            <li>
              <strong className='text-foreground'>Nonprofits</strong> browse
              available products and claim what they need
            </li>
            <li>
              <strong className='text-foreground'>Admins</strong> approve
              nonprofit registrations and manage the platform
            </li>
            <li>
              Coordinated pickups ensure safe and efficient food distribution
            </li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Key Features
          </h2>
          <ul className='list-inside list-disc space-y-2 text-foreground/80'>
            <li>Secure user authentication and role-based access</li>
            <li>Real-time product availability and claim tracking</li>
            <li>Document verification for nonprofit organizations</li>
            <li>Comprehensive dashboard for administrators</li>
            <li>Mobile-friendly interface for all users</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Impact
          </h2>
          <p className='leading-relaxed text-foreground/80'>
            Since our inception, MAFC has successfully redistributed thousands
            of pounds of food, serving hundreds of nonprofit organizations and
            helping feed thousands of people in need across the Atlanta area.
          </p>
        </section>
      </div>
    </div>
  );
}
