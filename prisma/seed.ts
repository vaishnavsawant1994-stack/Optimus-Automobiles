import 'dotenv/config'

import {
  FeatureCategory,
  InquiryStatus,
  PreferredContactMethod,
  RequestStatus,
  TestDriveStatus,
  UserStatus,
  VehicleImageCategory,
  VehicleStatus,
} from '@prisma/client'
import { Algorithm, hash } from '@node-rs/argon2'

import { createScriptPrismaClient } from '../scripts/script-prisma'

const prisma = createScriptPrismaClient()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function assertDevelopmentDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? ''
  const parsed = new URL(databaseUrl)
  const databaseName = parsed.pathname.replace(/^\//, '')
  const localHosts = new Set(['localhost', '127.0.0.1', '::1'])

  if (process.env.NODE_ENV === 'production') {
    throw new Error('The deterministic development seed cannot run in production.')
  }
  if (!localHosts.has(parsed.hostname) || databaseName !== 'deccan_wheels') {
    throw new Error(
      `Seed refused: expected the local deccan_wheels database, received ${parsed.hostname}/${databaseName}.`,
    )
  }
}

const brands = [
  ['Mercedes-Benz', 'mercedes-benz', 'Germany', true],
  ['BMW', 'bmw', 'Germany', true],
  ['Audi', 'audi', 'Germany', true],
  ['Porsche', 'porsche', 'Germany', true],
  ['Land Rover', 'land-rover', 'United Kingdom', true],
  ['Lexus', 'lexus', 'Japan', true],
  ['Volvo', 'volvo', 'Sweden', true],
  ['Jaguar', 'jaguar', 'United Kingdom', true],
  ['MINI', 'mini', 'United Kingdom', true],
  ['Toyota', 'toyota', 'Japan', true],
] as const

const bodyTypes = [
  ['Sedan', 'sedan', 'Refined four-door luxury cars for composed everyday travel.', 'car-front'],
  ['SUV', 'suv', 'Premium utility vehicles combining road presence, comfort and capability.', 'car'],
  ['Coupe', 'coupe', 'Two-door grand tourers with expressive performance-led design.', 'gauge'],
  ['Convertible', 'convertible', 'Open-top luxury cars created for memorable drives.', 'wind'],
  ['Hatchback', 'hatchback', 'Compact premium cars with city-friendly versatility.', 'car-front'],
  ['Sports Car', 'sports-car', 'Focused performance cars engineered for an engaging drive.', 'zap'],
  ['MUV', 'muv', 'Spacious multi-utility vehicles for premium group travel.', 'users'],
  ['Supercar', 'supercar', 'Rare, high-performance automobiles with exceptional engineering.', 'trophy'],
] as const

const featureGroups: Record<FeatureCategory, string[]> = {
  SAFETY: [
    'ABS',
    'Multiple Airbags',
    '360 Degree Camera',
    'Adaptive Cruise Control',
    'Blind Spot Monitoring',
    'Lane Keep Assist',
    'Parking Sensors',
    'Tyre Pressure Monitoring',
  ],
  COMFORT: [
    'Memory Seats',
    'Heated Seats',
    'Ventilated Seats',
    'Automatic Climate Control',
    'Powered Tailgate',
  ],
  INFOTAINMENT: ['Apple CarPlay', 'Android Auto', 'Premium Audio', 'Navigation System'],
  EXTERIOR: ['Sunroof', 'Panoramic Roof', 'LED Headlamps', 'Alloy Wheels'],
  INTERIOR: ['Ambient Lighting', 'Leather Upholstery', 'Digital Instrument Cluster'],
  PERFORMANCE: ['Drive Modes', 'Paddle Shifters', 'All-Wheel Drive', 'Air Suspension'],
  CONVENIENCE: ['Keyless Entry', 'Push Button Start', 'Wireless Charging', 'Electric ORVMs'],
}

const imagePool = [
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=88',
]

type VehicleSeed = {
  brand: string
  model: string
  variant: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  bodyType: string
  featured?: boolean
  certified?: boolean
  newArrival?: boolean
  status?: VehicleStatus
  exterior?: string
  image: string
}

const vehicles: VehicleSeed[] = [
  { brand: 'Mercedes-Benz', model: 'E-Class', variant: 'E 220d AMG Line', year: 2021, price: 5490000, mileage: 28500, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'sedan', featured: true, certified: true, newArrival: true, exterior: 'Obsidian Black', image: imagePool[0] },
  { brand: 'BMW', model: '5 Series', variant: '530i M Sport', year: 2022, price: 5690000, mileage: 22000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'sedan', featured: true, newArrival: true, exterior: 'Alpine White', image: imagePool[1] },
  { brand: 'Audi', model: 'Q7', variant: '45 TDI Quattro Premium Plus', year: 2020, price: 6790000, mileage: 31000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', featured: true, certified: true, exterior: 'Mythos Black', image: imagePool[2] },
  { brand: 'Porsche', model: 'Macan', variant: '2.0 Petrol', year: 2021, price: 7990000, mileage: 19000, fuel: 'Petrol', transmission: 'PDK', bodyType: 'suv', featured: true, newArrival: true, exterior: 'Volcano Grey', image: imagePool[3] },
  { brand: 'Land Rover', model: 'Range Rover', variant: 'Vogue SE', year: 2019, price: 9290000, mileage: 45000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', featured: true, certified: true, exterior: 'Santorini Black', image: imagePool[4] },
  { brand: 'Lexus', model: 'RX 300', variant: 'Luxury', year: 2021, price: 5990000, mileage: 26000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'suv', featured: true, newArrival: true, exterior: 'Sonic Quartz', image: imagePool[5] },
  { brand: 'Jaguar', model: 'XF', variant: '20d Prestige', year: 2019, price: 3290000, mileage: 38000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'sedan', featured: true, certified: true, exterior: 'British Racing Green', image: imagePool[6] },
  { brand: 'Volvo', model: 'XC60', variant: 'D4 Inscription', year: 2021, price: 4390000, mileage: 24000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', featured: true, newArrival: true, exterior: 'Onyx Black', image: imagePool[7] },
  { brand: 'MINI', model: 'Cooper S', variant: '3 Door', year: 2022, price: 2990000, mileage: 15000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'hatchback', featured: true, newArrival: true, exterior: 'British Racing Green', image: imagePool[8] },
  { brand: 'Toyota', model: 'Fortuner', variant: '2.8 Legender 4x4 AT', year: 2021, price: 3690000, mileage: 33000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', featured: true, certified: true, exterior: 'Pearl White', image: imagePool[9] },
  { brand: 'Mercedes-Benz', model: 'GLC', variant: 'GLC 300 4MATIC', year: 2022, price: 6690000, mileage: 18000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'suv', featured: true, newArrival: true, exterior: 'Graphite Grey', image: imagePool[10] },
  { brand: 'Audi', model: 'A6', variant: '35 TDI Technology', year: 2019, price: 3190000, mileage: 40000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'sedan', featured: true, certified: true, exterior: 'Navarra Blue', image: imagePool[11] },
  { brand: 'Mercedes-Benz', model: 'S-Class', variant: 'S 450 4MATIC', year: 2021, price: 14200000, mileage: 21300, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'sedan', certified: true, exterior: 'Obsidian Black', image: imagePool[10] },
  { brand: 'Mercedes-Benz', model: 'GLE', variant: '300d 4MATIC', year: 2020, price: 7350000, mileage: 35000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', exterior: 'Polar White', image: imagePool[0] },
  { brand: 'Mercedes-Benz', model: 'C-Class', variant: 'C 220d Progressive', year: 2020, price: 3850000, mileage: 29000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'sedan', certified: true, exterior: 'Selenite Grey', image: imagePool[10] },
  { brand: 'BMW', model: 'X5', variant: 'xDrive40d M Sport', year: 2020, price: 6490000, mileage: 36000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', newArrival: true, exterior: 'Alpine White', image: imagePool[1] },
  { brand: 'BMW', model: '3 Series', variant: '330i M Sport', year: 2021, price: 4490000, mileage: 25500, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'sedan', certified: true, exterior: 'Portimao Blue', image: imagePool[1] },
  { brand: 'BMW', model: 'X7', variant: 'xDrive30d DPE Signature', year: 2021, price: 9890000, mileage: 27000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', exterior: 'Carbon Black', image: imagePool[1] },
  { brand: 'BMW', model: '7 Series', variant: '740Li DPE Signature', year: 2019, price: 7590000, mileage: 42000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'sedan', exterior: 'Mineral White', image: imagePool[1] },
  { brand: 'Audi', model: 'A4', variant: '40 TFSI Premium Plus', year: 2022, price: 4290000, mileage: 14500, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'sedan', newArrival: true, exterior: 'Glacier White', image: imagePool[11] },
  { brand: 'Audi', model: 'Q5', variant: '45 TFSI Technology', year: 2021, price: 5250000, mileage: 24000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'suv', certified: true, exterior: 'District Green', image: imagePool[2] },
  { brand: 'Porsche', model: 'Cayenne', variant: 'Platinum Edition', year: 2022, price: 11800000, mileage: 18400, fuel: 'Petrol', transmission: 'Tiptronic', bodyType: 'suv', newArrival: true, exterior: 'Jet Black', image: imagePool[3] },
  { brand: 'Porsche', model: '718 Cayman', variant: 'Style Edition', year: 2021, price: 11200000, mileage: 12000, fuel: 'Petrol', transmission: 'PDK', bodyType: 'sports-car', certified: true, exterior: 'Guards Red', image: imagePool[3] },
  { brand: 'Land Rover', model: 'Discovery', variant: 'HSE Luxury', year: 2019, price: 4990000, mileage: 42000, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', certified: true, exterior: 'Fuji White', image: imagePool[4] },
  { brand: 'Land Rover', model: 'Defender', variant: '110 HSE', year: 2022, price: 10200000, mileage: 16700, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'suv', newArrival: true, exterior: 'Pangea Green', image: imagePool[4] },
  { brand: 'Lexus', model: 'ES 300h', variant: 'Luxury', year: 2021, price: 4625000, mileage: 22000, fuel: 'Hybrid', transmission: 'Automatic', bodyType: 'sedan', certified: true, exterior: 'Sonic Titanium', image: imagePool[5] },
  { brand: 'Volvo', model: 'XC90', variant: 'B6 Inscription', year: 2022, price: 8290000, mileage: 19800, fuel: 'Hybrid', transmission: 'Automatic', bodyType: 'suv', newArrival: true, exterior: 'Denim Blue', image: imagePool[7] },
  { brand: 'Jaguar', model: 'F-PACE', variant: 'R-Dynamic S', year: 2021, price: 7250000, mileage: 24700, fuel: 'Diesel', transmission: 'Automatic', bodyType: 'suv', certified: true, exterior: 'Eiger Grey', image: imagePool[6] },
  { brand: 'MINI', model: 'Countryman', variant: 'Cooper S JCW Inspired', year: 2021, price: 3990000, mileage: 21000, fuel: 'Petrol', transmission: 'Automatic', bodyType: 'hatchback', exterior: 'Chilli Red', image: imagePool[8] },
  { brand: 'Toyota', model: 'Camry', variant: 'Hybrid', year: 2022, price: 3990000, mileage: 18000, fuel: 'Hybrid', transmission: 'Automatic', bodyType: 'sedan', certified: true, exterior: 'Platinum White', image: imagePool[9] },
]

async function main() {
  assertDevelopmentDatabase()

  const brandByName = new Map<string, string>()
  for (const [name, slug, country, featured] of brands) {
    const brand = await prisma.brand.upsert({
      where: { slug },
      update: {
        name,
        logoUrl: `/images/brands/${slug}.svg`,
        logoAlt: `${name} logo`,
        description: `${name} pre-owned luxury cars selected and inspected by Deccan Wheels.`,
        country,
        featured,
        active: true,
        displayOrder: brands.findIndex((item) => item[1] === slug) + 1,
      },
      create: {
        name,
        slug,
        logoUrl: `/images/brands/${slug}.svg`,
        logoAlt: `${name} logo`,
        description: `${name} pre-owned luxury cars selected and inspected by Deccan Wheels.`,
        country,
        featured,
        active: true,
        displayOrder: brands.findIndex((item) => item[1] === slug) + 1,
      },
    })
    brandByName.set(name, brand.id)
  }

  const bodyTypeBySlug = new Map<string, string>()
  for (const [name, slug, description, icon] of bodyTypes) {
    const bodyType = await prisma.bodyType.upsert({
      where: { slug },
      update: { name, description, icon, featured: true, active: true, displayOrder: bodyTypes.findIndex((item) => item[1] === slug) + 1 },
      create: { name, slug, description, icon, featured: true, active: true, displayOrder: bodyTypes.findIndex((item) => item[1] === slug) + 1 },
    })
    bodyTypeBySlug.set(slug, bodyType.id)
  }

  const featureIds: string[] = []
  for (const [category, names] of Object.entries(featureGroups) as [FeatureCategory, string[]][]) {
    for (const name of names) {
      const feature = await prisma.feature.upsert({
        where: { slug: slugify(name) },
        update: { name, category, active: true },
        create: { name, slug: slugify(name), category, active: true },
      })
      featureIds.push(feature.id)
    }
  }

  const vehicleBySlug = new Map<string, string>()
  for (const [index, source] of vehicles.entries()) {
    const slug = slugify(`${source.brand}-${source.model}-${source.variant}-${source.year}`)
    const shortTitle = `${source.brand} ${source.model}`
    const publishedAt = new Date(Date.UTC(2026, 6, 30 - index, 9, 0, 0))
    const vehicle = await prisma.vehicle.upsert({
      where: { slug },
      update: {
        brandId: brandByName.get(source.brand)!,
        bodyTypeId: bodyTypeBySlug.get(source.bodyType)!,
        model: source.model,
        variant: source.variant,
        shortTitle,
        year: source.year,
        registrationYear: source.year,
        registrationState: 'Telangana',
        price: source.price,
        originalPrice: Math.round(source.price * 1.08),
        mileage: source.mileage,
        fuelType: source.fuel,
        transmission: source.transmission,
        exteriorColor: source.exterior,
        interiorColor: 'Black Nappa Leather',
        ownershipCount: index % 3 === 0 ? 2 : 1,
        engineDisplacement: source.fuel === 'Diesel' ? 1995 : source.fuel === 'Hybrid' ? 2487 : 1998,
        engineDescription: `${source.fuel} engine with complete service history`,
        power: `${180 + (index % 8) * 18} bhp`,
        torque: `${320 + (index % 7) * 40} Nm`,
        drivetrain: source.bodyType === 'suv' ? 'All-Wheel Drive' : 'Rear-Wheel Drive',
        seatingCapacity: source.bodyType === 'suv' && index % 2 === 0 ? 7 : 5,
        doors: source.bodyType === 'sports-car' ? 2 : 4,
        registrationNumberMasked: `TS 09 ** ${String(1100 + index).slice(-4)}`,
        insuranceValidity: new Date(Date.UTC(2027, index % 12, 15)),
        serviceHistory: 'Authorised service centre records available',
        keysAvailable: 2,
        shortDescription: `A carefully inspected ${source.year} ${shortTitle} in ${source.exterior ?? 'premium finish'}.`,
        description: `${shortTitle} ${source.variant} combines premium comfort, confident performance and transparent ownership history. This Deccan Wheels vehicle has been inspected, road tested and prepared for delivery in Hyderabad.`,
        status: source.status ?? VehicleStatus.AVAILABLE,
        featured: Boolean(source.featured),
        newArrival: Boolean(source.newArrival),
        certified: Boolean(source.certified),
        published: true,
        viewCount: 760 - index * 13,
        favoriteCount: 94 - index * 2,
        publishedAt,
      },
      create: {
        slug,
        stockNumber: `DW-${String(index + 1).padStart(4, '0')}`,
        brandId: brandByName.get(source.brand)!,
        bodyTypeId: bodyTypeBySlug.get(source.bodyType)!,
        model: source.model,
        variant: source.variant,
        shortTitle,
        year: source.year,
        registrationYear: source.year,
        registrationState: 'Telangana',
        price: source.price,
        originalPrice: Math.round(source.price * 1.08),
        mileage: source.mileage,
        fuelType: source.fuel,
        transmission: source.transmission,
        exteriorColor: source.exterior,
        interiorColor: 'Black Nappa Leather',
        ownershipCount: index % 3 === 0 ? 2 : 1,
        engineDisplacement: source.fuel === 'Diesel' ? 1995 : source.fuel === 'Hybrid' ? 2487 : 1998,
        engineDescription: `${source.fuel} engine with complete service history`,
        power: `${180 + (index % 8) * 18} bhp`,
        torque: `${320 + (index % 7) * 40} Nm`,
        drivetrain: source.bodyType === 'suv' ? 'All-Wheel Drive' : 'Rear-Wheel Drive',
        seatingCapacity: source.bodyType === 'suv' && index % 2 === 0 ? 7 : 5,
        doors: source.bodyType === 'sports-car' ? 2 : 4,
        registrationNumberMasked: `TS 09 ** ${String(1100 + index).slice(-4)}`,
        insuranceValidity: new Date(Date.UTC(2027, index % 12, 15)),
        serviceHistory: 'Authorised service centre records available',
        keysAvailable: 2,
        shortDescription: `A carefully inspected ${source.year} ${shortTitle} in ${source.exterior ?? 'premium finish'}.`,
        description: `${shortTitle} ${source.variant} combines premium comfort, confident performance and transparent ownership history. This Deccan Wheels vehicle has been inspected, road tested and prepared for delivery in Hyderabad.`,
        status: source.status ?? VehicleStatus.AVAILABLE,
        featured: Boolean(source.featured),
        newArrival: Boolean(source.newArrival),
        certified: Boolean(source.certified),
        published: true,
        viewCount: 760 - index * 13,
        favoriteCount: 94 - index * 2,
        publishedAt,
      },
    })
    vehicleBySlug.set(slug, vehicle.id)

    await prisma.vehicleImage.deleteMany({ where: { vehicleId: vehicle.id } })
    const imageCount = source.featured ? 8 : 3
    await prisma.vehicleImage.createMany({
      data: Array.from({ length: imageCount }, (_, imageIndex) => ({
        vehicleId: vehicle.id,
        url: imageIndex === 0 ? source.image : imagePool[(index + imageIndex) % imagePool.length],
        thumbnailUrl: imageIndex === 0 ? source.image : imagePool[(index + imageIndex) % imagePool.length],
        altText: `${source.year} ${shortTitle} ${source.variant} ${imageIndex === 0 ? 'front exterior' : `gallery view ${imageIndex + 1}`}`,
        category: imageIndex < 3 ? VehicleImageCategory.EXTERIOR : imageIndex < 6 ? VehicleImageCategory.INTERIOR : VehicleImageCategory.DETAIL,
        sortOrder: imageIndex,
        width: 1600,
        height: 1067,
        isPrimary: imageIndex === 0,
      })),
    })

    await prisma.vehicleFeature.deleteMany({ where: { vehicleId: vehicle.id } })
    const selectedFeatures = Array.from({ length: 14 }, (_, offset) => featureIds[(index * 3 + offset) % featureIds.length])
    await prisma.vehicleFeature.createMany({
      data: [...new Set(selectedFeatures)].map((featureId) => ({ vehicleId: vehicle.id, featureId })),
    })
  }

  const demoPasswordHash = await hash('DriveLuxury!2026', {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  })
  const verifiedCustomer = await prisma.user.upsert({
    where: { email: 'customer@deccanwheels.local' },
    update: {
      name: 'Aarav Sharma',
      phone: '+919876540101',
      city: 'Hyderabad',
      passwordHash: demoPasswordHash,
      status: UserStatus.ACTIVE,
      emailVerified: new Date('2026-07-15T10:00:00.000Z'),
      preferredContactMethod: PreferredContactMethod.WHATSAPP,
      deletedAt: null,
    },
    create: {
      name: 'Aarav Sharma',
      email: 'customer@deccanwheels.local',
      phone: '+919876540101',
      city: 'Hyderabad',
      passwordHash: demoPasswordHash,
      status: UserStatus.ACTIVE,
      emailVerified: new Date('2026-07-15T10:00:00.000Z'),
      preferredContactMethod: PreferredContactMethod.WHATSAPP,
    },
  })

  await prisma.user.upsert({
    where: { email: 'pending@deccanwheels.local' },
    update: {
      name: 'Pending Customer',
      phone: '+919876540102',
      city: 'Hyderabad',
      passwordHash: demoPasswordHash,
      status: UserStatus.PENDING_VERIFICATION,
      emailVerified: null,
      deletedAt: null,
    },
    create: {
      name: 'Pending Customer',
      email: 'pending@deccanwheels.local',
      phone: '+919876540102',
      city: 'Hyderabad',
      passwordHash: demoPasswordHash,
      status: UserStatus.PENDING_VERIFICATION,
    },
  })

  await prisma.customerNotificationSettings.upsert({
    where: { userId: verifiedCustomer.id },
    update: {
      enquiryUpdates: true,
      testDriveReminders: true,
      priceChangeAlerts: true,
      soldVehicleAlerts: true,
      marketingEmails: false,
      whatsAppUpdates: true,
      whatsAppConsentedAt: new Date('2026-07-15T10:00:00.000Z'),
    },
    create: {
      userId: verifiedCustomer.id,
      enquiryUpdates: true,
      testDriveReminders: true,
      priceChangeAlerts: true,
      soldVehicleAlerts: true,
      marketingEmails: false,
      whatsAppUpdates: true,
      whatsAppConsentedAt: new Date('2026-07-15T10:00:00.000Z'),
    },
  })

  const demoVehicleIds = [
    vehicleBySlug.get('mercedes-benz-e-class-e-220d-amg-line-2021'),
    vehicleBySlug.get('bmw-5-series-530i-m-sport-2022'),
    vehicleBySlug.get('audi-q7-45-tdi-quattro-premium-plus-2020'),
  ].filter((id): id is string => Boolean(id))
  await prisma.favorite.deleteMany({ where: { userId: verifiedCustomer.id } })
  await prisma.favorite.createMany({
    data: demoVehicleIds.map((vehicleId) => ({ userId: verifiedCustomer.id, vehicleId })),
    skipDuplicates: true,
  })

  await prisma.inquiry.upsert({
    where: { referenceNumber: 'DW-ENQ-DEMO-000001' },
    update: {
      userId: verifiedCustomer.id,
      vehicleId: demoVehicleIds[0],
      fullName: verifiedCustomer.name ?? 'Aarav Sharma',
      phone: verifiedCustomer.phone ?? '+919876540101',
      email: verifiedCustomer.email,
      message: 'Please share the inspection report and available finance options.',
      consentAccepted: true,
      preferredContactMethod: PreferredContactMethod.WHATSAPP,
      status: InquiryStatus.CONTACTED,
    },
    create: {
      referenceNumber: 'DW-ENQ-DEMO-000001',
      userId: verifiedCustomer.id,
      vehicleId: demoVehicleIds[0],
      fullName: verifiedCustomer.name ?? 'Aarav Sharma',
      phone: verifiedCustomer.phone ?? '+919876540101',
      email: verifiedCustomer.email,
      message: 'Please share the inspection report and available finance options.',
      consentAccepted: true,
      preferredContactMethod: PreferredContactMethod.WHATSAPP,
      status: InquiryStatus.CONTACTED,
    },
  })

  await prisma.testDrive.upsert({
    where: { referenceNumber: 'DW-TD-DEMO-000001' },
    update: {
      userId: verifiedCustomer.id,
      vehicleId: demoVehicleIds[1],
      fullName: verifiedCustomer.name ?? 'Aarav Sharma',
      phone: verifiedCustomer.phone ?? '+919876540101',
      email: verifiedCustomer.email,
      preferredDate: new Date('2026-08-08T00:00:00.000Z'),
      preferredTime: '11:30 AM',
      confirmedDate: new Date('2026-08-08T00:00:00.000Z'),
      confirmedTime: '11:30 AM',
      consentAccepted: true,
      preferredContactMethod: PreferredContactMethod.WHATSAPP,
      status: TestDriveStatus.CONFIRMED,
    },
    create: {
      referenceNumber: 'DW-TD-DEMO-000001',
      userId: verifiedCustomer.id,
      vehicleId: demoVehicleIds[1],
      fullName: verifiedCustomer.name ?? 'Aarav Sharma',
      phone: verifiedCustomer.phone ?? '+919876540101',
      email: verifiedCustomer.email,
      preferredDate: new Date('2026-08-08T00:00:00.000Z'),
      preferredTime: '11:30 AM',
      confirmedDate: new Date('2026-08-08T00:00:00.000Z'),
      confirmedTime: '11:30 AM',
      consentAccepted: true,
      preferredContactMethod: PreferredContactMethod.WHATSAPP,
      status: TestDriveStatus.CONFIRMED,
    },
  })

  await prisma.sellRequest.upsert({
    where: { referenceNumber: 'DW-SELL-DEMO-000001' },
    update: {
      userId: verifiedCustomer.id,
      status: RequestStatus.CONTACTED,
      name: verifiedCustomer.name,
      email: verifiedCustomer.email,
      phone: verifiedCustomer.phone,
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2019,
      mileage: 41000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      city: 'Hyderabad',
    },
    create: {
      referenceNumber: 'DW-SELL-DEMO-000001',
      userId: verifiedCustomer.id,
      status: RequestStatus.CONTACTED,
      name: verifiedCustomer.name,
      email: verifiedCustomer.email,
      phone: verifiedCustomer.phone,
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2019,
      mileage: 41000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      city: 'Hyderabad',
    },
  })

  for (const key of ['ENQ', 'TD', 'SELL']) {
    await prisma.referenceCounter.upsert({
      where: { key },
      update: { value: { set: 100 } },
      create: { key, value: 100 },
    })
  }

  await prisma.showroom.upsert({
    where: { id: 'main-showroom' },
    update: {
      name: 'Deccan Wheels',
      address: 'Road No. 12, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500034',
      phone: '+91 98765 43210',
      email: 'info@deccanwheels.com',
      hours: 'Mon - Sun: 10:00 AM - 8:00 PM',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Road%20No.%2012%20Banjara%20Hills%20Hyderabad',
      active: true,
    },
    create: {
      id: 'main-showroom',
      name: 'Deccan Wheels',
      address: 'Road No. 12, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500034',
      phone: '+91 98765 43210',
      email: 'info@deccanwheels.com',
      hours: 'Mon - Sun: 10:00 AM - 8:00 PM',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Road%20No.%2012%20Banjara%20Hills%20Hyderabad',
      active: true,
    },
  })

  const settings = {
    site_name: 'Deccan Wheels',
    site_tagline: 'Premium pre-owned luxury cars',
    inventory_location: 'Banjara Hills, Hyderabad',
    support_phone: '+91 98765 43210',
    currency: 'INR',
  }
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
  }

  const [brandCount, bodyTypeCount, vehicleCount, featureCount, imageCount] = await Promise.all([
    prisma.brand.count(),
    prisma.bodyType.count(),
    prisma.vehicle.count(),
    prisma.feature.count(),
    prisma.vehicleImage.count(),
  ])
  console.info({ brandCount, bodyTypeCount, vehicleCount, featureCount, imageCount })
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
