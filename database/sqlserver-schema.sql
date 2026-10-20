/* ============================================================================
   VELOCITY RENTALS — SQL Server (SSMS) Schema + Seed Script
   ----------------------------------------------------------------------------
   HOW TO USE
   1. Open SQL Server Management Studio (SSMS) and connect to your instance
      (e.g. localhost with Windows Authentication).
   2. Open this file and press F5 (Execute).
   3. It drops and recreates the "VelocityRentals" database, creates all
      tables, foreign keys, indexes and inserts the full seed dataset.

   NOTES
   - Money is stored as DECIMAL(12,2) rand values (ZAR).
   - Features are stored as comma-separated text (SQL Server has no array type).
   - Sample reporting queries are included at the bottom.
   ========================================================================== */

USE master;
GO

IF DB_ID('VelocityRentals') IS NOT NULL
BEGIN
    ALTER DATABASE VelocityRentals SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE VelocityRentals;
END
GO

CREATE DATABASE VelocityRentals;
GO

USE VelocityRentals;
GO

/* ---------------------------------------------------------------------------
   TABLES
   --------------------------------------------------------------------------- */

CREATE TABLE dbo.Vehicles
(
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(120)  NOT NULL,
    Make            NVARCHAR(60)   NOT NULL,
    Model           NVARCHAR(60)   NOT NULL,
    [Year]          INT            NOT NULL,
    Category        NVARCHAR(30)   NOT NULL,          -- SUV, Sedan, Sports, Supercar, Luxury, Hatchback, Bakkie, Convertible, Van
    Transmission    NVARCHAR(20)   NOT NULL,          -- Automatic | Manual
    Fuel            NVARCHAR(20)   NOT NULL,          -- Petrol | Diesel | Hybrid | Electric
    Seats           INT            NOT NULL DEFAULT 5,
    Doors           INT            NOT NULL DEFAULT 4,
    DailyRate       DECIMAL(12,2)  NOT NULL,          -- ZAR per day
    Deposit         DECIMAL(12,2)  NOT NULL DEFAULT 0,
    Mileage         INT            NOT NULL DEFAULT 0, -- odometer km
    Color           NVARCHAR(40)   NOT NULL DEFAULT 'Black',
    LicensePlate    NVARCHAR(20)   NOT NULL,
    [Status]        NVARCHAR(20)   NOT NULL DEFAULT 'available', -- available | rented | maintenance | retired
    Features        NVARCHAR(500)  NOT NULL DEFAULT '',
    ImageUrl        NVARCHAR(500)  NOT NULL,
    [Description]   NVARCHAR(1000) NOT NULL DEFAULT '',
    [Location]      NVARCHAR(40)   NOT NULL DEFAULT 'Cape Town',
    CreatedAt       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.Customers
(
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    FullName        NVARCHAR(120) NOT NULL,
    Email           NVARCHAR(160) NOT NULL,
    Phone           NVARCHAR(30)  NOT NULL DEFAULT '',
    LicenseNumber   NVARCHAR(40)  NOT NULL DEFAULT '',
    IdNumber        NVARCHAR(40)  NOT NULL DEFAULT '',
    City            NVARCHAR(60)  NOT NULL DEFAULT '',
    Notes           NVARCHAR(500) NOT NULL DEFAULT '',
    CreatedAt       DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.Bookings
(
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(12)  NOT NULL UNIQUE,
    VehicleId       INT           NOT NULL REFERENCES dbo.Vehicles(Id)  ON DELETE CASCADE,
    CustomerId      INT           NOT NULL REFERENCES dbo.Customers(Id) ON DELETE CASCADE,
    StartDate       DATE          NOT NULL,
    EndDate         DATE          NOT NULL,
    PickupLocation  NVARCHAR(40)  NOT NULL,
    DropoffLocation NVARCHAR(40)  NOT NULL,
    [Status]        NVARCHAR(20)  NOT NULL DEFAULT 'pending', -- pending | confirmed | active | completed | cancelled
    Extras          NVARCHAR(500) NOT NULL DEFAULT '',        -- human-readable extras summary
    BaseAmount      DECIMAL(12,2) NOT NULL,
    ExtrasAmount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    TotalAmount     DECIMAL(12,2) NOT NULL,                   -- ZAR
    Notes           NVARCHAR(500) NOT NULL DEFAULT '',
    CreatedAt       DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE NONCLUSTERED INDEX IX_Bookings_Vehicle  ON dbo.Bookings(VehicleId);
CREATE NONCLUSTERED INDEX IX_Bookings_Status   ON dbo.Bookings([Status]);
CREATE NONCLUSTERED INDEX IX_Bookings_Customer ON dbo.Bookings(CustomerId);
GO

/* ---------------------------------------------------------------------------
   SEED — VEHICLES (20)
   --------------------------------------------------------------------------- */

SET IDENTITY_INSERT dbo.Vehicles ON;
INSERT INTO dbo.Vehicles
    (Id, Name, Make, Model, [Year], Category, Transmission, Fuel, Seats, Doors,
     DailyRate, Deposit, Mileage, Color, LicensePlate, [Status], Features, ImageUrl, [Description], [Location])
VALUES
(1, 'Lamborghini Huracán STO', 'Lamborghini', 'Huracán STO', 2023, 'Supercar', 'Automatic', 'Petrol', 2, 2, 16500.00, 25000.00, 12400, 'Arancio Borealis', 'VX 001 GP', 'available',
 'Launch Control, Paddle Shifters, 360° Camera, Apple CarPlay, Premium Sound, Ambient Lighting',
 'https://images.pexels.com/photos/33974729/pexels-photo-33974729.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'A street-legal racer with a 470 kW naturally-aspirated V10, rear-wheel steering and razor-honed aero.', 'Johannesburg'),
(2, 'Ferrari Roma', 'Ferrari', 'Roma', 2022, 'Supercar', 'Automatic', 'Petrol', 2, 2, 15800.00, 25000.00, 9800, 'Rosso Corsa', 'FR 62 GT GP', 'available',
 'Launch Control, Paddle Shifters, Apple CarPlay, Leather Seats, Blind Spot Monitor, Premium Sound',
 'https://images.pexels.com/photos/12506011/pexels-photo-12506011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'A twin-turbo V8 grand tourer that pairs 456 kW with timeless Italian elegance.', 'Johannesburg'),
(3, 'Aston Martin Vantage', 'Aston Martin', 'Vantage', 2022, 'Supercar', 'Automatic', 'Petrol', 2, 2, 13900.00, 20000.00, 15200, 'Onyx Black', 'AM V8 GP', 'available',
 'Paddle Shifters, Launch Control, Memory Seats, 360° Camera, Apple CarPlay, Premium Sound',
 'https://images.pexels.com/photos/94272/sports-car-pkw-auto-vehicle-94272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'A 4.0-litre twin-turbo V8 wrapped in uncompromising British design.', 'Johannesburg'),
(4, 'Aston Martin DB12', 'Aston Martin', 'DB12', 2024, 'Supercar', 'Automatic', 'Petrol', 2, 2, 14900.00, 20000.00, 4300, 'Magnetic Silver', 'DB 012 CA', 'available',
 'Paddle Shifters, Adaptive Cruise Control, Apple CarPlay, Leather Seats, Ambient Lighting, Head-Up Display',
 'https://images.pexels.com/photos/19986960/pexels-photo-19986960.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'The world''s first Super Tourer — 500 kW and a hand-crafted cabin.', 'Cape Town'),
(5, 'Chevrolet Camaro SS', 'Chevrolet', 'Camaro SS', 2021, 'Sports', 'Automatic', 'Petrol', 4, 2, 4950.00, 7500.00, 31200, 'Shadow Black', 'YR 88 SS GP', 'available',
 'Launch Control, Paddle Shifters, Bluetooth, Reverse Camera, Premium Sound, Heated Seats',
 'https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'An American icon with a 6.2-litre small-block V8 under the bonnet.', 'Pretoria'),
(6, 'Mercedes-Benz S 580', 'Mercedes-Benz', 'S 580', 2023, 'Luxury', 'Automatic', 'Hybrid', 5, 4, 6850.00, 10000.00, 18800, 'Obsidian Black', 'CA 902-114', 'available',
 'Air Suspension, Adaptive Cruise Control, Panoramic Roof, Heated Seats, Ambient Lighting, Head-Up Display, Memory Seats, Premium Sound',
 'https://images.pexels.com/photos/12122221/pexels-photo-12122221.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'The benchmark for executive travel — whisper-quiet V8 with EQ Boost.', 'Cape Town'),
(7, 'Genesis G80 3.5T', 'Genesis', 'G80', 2023, 'Luxury', 'Automatic', 'Petrol', 5, 4, 3250.00, 5000.00, 20900, 'Vanta Black', 'G80 CA 412', 'available',
 'Leather Seats, Heated Seats, Adaptive Cruise Control, 360° Camera, Apple CarPlay, Blind Spot Monitor',
 'https://images.pexels.com/photos/32644774/pexels-photo-32644774.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'Understated luxury with a twin-turbo V6 and a superb interior.', 'Cape Town'),
(8, 'Genesis G70 3.3T Sport', 'Genesis', 'G70', 2022, 'Sedan', 'Automatic', 'Petrol', 5, 4, 2450.00, 4000.00, 27600, 'Kavala Grey', 'CA 317-880', 'available',
 'Paddle Shifters, Leather Seats, Apple CarPlay, Android Auto, Blind Spot Monitor, Sunroof',
 'https://images.pexels.com/photos/11936975/pexels-photo-11936975.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'A compact sports sedan with a 274 kW twin-turbo punch.', 'Cape Town'),
(9, 'Mercedes-AMG SL 43', 'Mercedes-AMG', 'SL 43', 2023, 'Convertible', 'Automatic', 'Petrol', 4, 2, 7450.00, 12000.00, 8900, 'Graphite Black', 'SL 043 CA', 'available',
 'Air Suspension, Paddle Shifters, Heated Seats, Apple CarPlay, Ambient Lighting, Premium Sound',
 'https://images.pexels.com/photos/27414170/pexels-photo-27414170.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'Roof down, coastal road ahead — AMG punch with open-air glamour.', 'Cape Town'),
(10, 'BMW X5 xDrive40i', 'BMW', 'X5 xDrive40i', 2023, 'SUV', 'Automatic', 'Hybrid', 5, 4, 2850.00, 5000.00, 22400, 'Black Sapphire', 'KX 84 X5 GP', 'rented',
 'Panoramic Roof, Air Suspension, Adaptive Cruise Control, 360° Camera, Heated Seats, Apple CarPlay',
 'https://images.pexels.com/photos/27502215/pexels-photo-27502215.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'The definitive luxury family SUV with silky straight-six power.', 'Johannesburg'),
(11, 'Genesis GV80 3.5T', 'Genesis', 'GV80', 2023, 'SUV', 'Automatic', 'Petrol', 7, 4, 2950.00, 5000.00, 17600, 'Adriatic Blue', 'GV 80 PT GP', 'available',
 'Panoramic Roof, Heated Seats, Adaptive Cruise Control, 360° Camera, Blind Spot Monitor, Premium Sound',
 'https://images.pexels.com/photos/11808155/pexels-photo-11808155.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'Seven seats of quilted-leather serenity with a twin-turbo V6.', 'Pretoria'),
(12, 'Mercedes-Benz GLE 450', 'Mercedes-Benz', 'GLE 450', 2022, 'SUV', 'Automatic', 'Hybrid', 5, 4, 2650.00, 5000.00, 33800, 'Selenite Grey', 'ND 511-208', 'available',
 'Air Suspension, Panoramic Roof, 4x4 Low Range, Adaptive Cruise Control, Apple CarPlay, Heated Seats',
 'https://images.pexels.com/photos/15047473/pexels-photo-15047473.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'EQ-boosted six-cylinder smoothness with real gravel-road ability.', 'Durban'),
(13, 'Land Rover Defender 110', 'Land Rover', 'Defender 110 D300', 2023, 'SUV', 'Automatic', 'Diesel', 5, 4, 2950.00, 6000.00, 24100, 'Pangea Green', 'CA 446-722', 'rented',
 '4x4 Low Range, Diff Lock, Air Suspension, Roof Rails, 360° Camera, Tow Bar, Panoramic Roof',
 'https://images.pexels.com/photos/11749418/pexels-photo-11749418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'An icon rebuilt for the modern overlander — torquey diesel and unstoppable composure.', 'Cape Town'),
(14, 'Mitsubishi Pajero Sport 2.4', 'Mitsubishi', 'Pajero Sport 2.4 Di-D', 2022, 'SUV', 'Automatic', 'Diesel', 7, 4, 1450.00, 3000.00, 41200, 'White Diamond', 'ND 388-416', 'available',
 '4x4 Low Range, Diff Lock, Tow Bar, Reverse Camera, Bluetooth, Roof Rails',
 'https://images.pexels.com/photos/18080572/pexels-photo-18080572.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'Seven seats, proper low range and a reputation earned on African dirt.', 'Durban'),
(15, 'Volvo XC60 T6', 'Volvo', 'XC60 T6', 2022, 'SUV', 'Automatic', 'Petrol', 5, 4, 1850.00, 3500.00, 28900, 'Denim Blue', 'WF 22 EC 668', 'available',
 'Panoramic Roof, Adaptive Cruise Control, Lane Keep Assist, Blind Spot Monitor, Heated Seats, Apple CarPlay',
 'https://images.pexels.com/photos/26932988/pexels-photo-26932988.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'Scandinavian calm for long Eastern Cape roads.', 'Gqeberha'),
(16, 'Volkswagen Golf 8 GTI', 'Volkswagen', 'Golf 8 GTI', 2023, 'Hatchback', 'Automatic', 'Petrol', 5, 4, 1250.00, 2500.00, 16900, 'Kings Red', 'CA 717-302', 'rented',
 'Paddle Shifters, Launch Control, Heated Seats, Apple CarPlay, Android Auto, Ambient Lighting',
 'https://images.pexels.com/photos/28447305/pexels-photo-28447305.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'South Africa''s favourite hot hatch — 180 kW of everyday usable pace.', 'Cape Town'),
(17, 'Hyundai i30 N', 'Hyundai', 'i30 N', 2022, 'Hatchback', 'Manual', 'Petrol', 5, 4, 1450.00, 2500.00, 21500, 'Shadow Grey', 'NN 30 GP 481', 'maintenance',
 'Launch Control, Paddle Shifters, Bluetooth, Apple CarPlay, Android Auto, Premium Sound',
 'https://images.pexels.com/photos/17404303/pexels-photo-17404303.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'A riot on three pedals — crackling exhaust and a Nürburgring-honed chassis.', 'Johannesburg'),
(18, 'Toyota Hilux GR-S III', 'Toyota', 'Hilux GR-S III', 2023, 'Bakkie', 'Automatic', 'Diesel', 5, 4, 1850.00, 3500.00, 38700, 'Glacier White', 'FND 647 FS', 'available',
 '4x4 Low Range, Diff Lock, Tow Bar, Reverse Camera, Bluetooth, Roof Rails',
 'https://images.pexels.com/photos/20000204/pexels-photo-20000204.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'The legend, Gazoo Racing tuned — built for the Karoo and beyond.', 'Bloemfontein'),
(19, 'Ford Ranger Wildtrak 3.0 V6', 'Ford', 'Ranger Wildtrak', 2023, 'Bakkie', 'Automatic', 'Diesel', 5, 4, 1650.00, 3500.00, 34800, 'Conquer Grey', 'TR 91 WT GP', 'available',
 '4x4 Low Range, Diff Lock, Tow Bar, 360° Camera, Adaptive Cruise Control, Apple CarPlay',
 'https://images.pexels.com/photos/9737550/pexels-photo-9737550.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'A 184 kW V6 turbodiesel bakkie that tows 3.5 tonnes and cruises like an SUV.', 'Pretoria'),
(20, 'Mercedes-Benz V-Class V250d', 'Mercedes-Benz', 'V-Class V250d', 2022, 'Van', 'Automatic', 'Diesel', 7, 4, 2450.00, 4000.00, 19200, 'Obsidian Black', 'CA 882-914', 'available',
 'Leather Seats, Heated Seats, Adaptive Cruise Control, 360° Camera, Apple CarPlay, Ambient Lighting',
 'https://images.pexels.com/photos/39416591/pexels-photo-39416591.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'Business-class travel for seven — captain''s chairs and a hushed diesel.', 'Cape Town');
SET IDENTITY_INSERT dbo.Vehicles OFF;
GO

/* ---------------------------------------------------------------------------
   SEED — CUSTOMERS (8)
   --------------------------------------------------------------------------- */

SET IDENTITY_INSERT dbo.Customers ON;
INSERT INTO dbo.Customers (Id, FullName, Email, Phone, LicenseNumber, City)
VALUES
(1, 'Thandiwe Nkosi',        'thandiwe.nkosi@gmail.com',  '+27 82 555 0134', 'NKOTH850221LC', 'Cape Town'),
(2, 'Pieter van der Merwe',  'pieter.vdm@outlook.com',    '+27 83 555 0921', 'VDMPIE771104LC', 'Pretoria'),
(3, 'Sipho Dlamini',         'sipho.dlamini@gmail.com',   '+27 72 555 0342', 'DLASIP900316LC', 'Durban'),
(4, 'Ayesha Patel',          'ayesha.patel@icloud.com',   '+27 84 555 0789', 'PATAYE880512LC', 'Johannesburg'),
(5, 'Johan Botha',           'johan.botha@gmail.com',     '+27 82 555 1104', 'BOTJOH810928LC', 'Bloemfontein'),
(6, 'Lerato Mokoena',        'lerato.mokoena@gmail.com',  '+27 73 555 0667', 'MOKLER940203LC', 'Johannesburg'),
(7, 'Daniel Petersen',       'd.petersen@gmail.com',      '+27 81 555 0458', 'PETDAN860730LC', 'Cape Town'),
(8, 'Naledi Khumalo',        'naledi.k@gmail.com',        '+27 79 555 0881', 'KHUNAL910417LC', 'Durban');
SET IDENTITY_INSERT dbo.Customers OFF;
GO

/* ---------------------------------------------------------------------------
   SEED — BOOKINGS (14)
   --------------------------------------------------------------------------- */

SET IDENTITY_INSERT dbo.Bookings ON;
INSERT INTO dbo.Bookings
    (Id, Reference, VehicleId, CustomerId, StartDate, EndDate, PickupLocation, DropoffLocation,
     [Status], Extras, BaseAmount, ExtrasAmount, TotalAmount, Notes, CreatedAt)
VALUES
(1,  'VX-7K2M4P', 10, 4, '2026-10-17', '2026-10-22', 'Johannesburg', 'Johannesburg', 'active',
     'Full Cover Insurance (R 250/day)', 14250.00, 1250.00, 15500.00, 'Airport collection — OR Tambo.', '2026-10-08T09:14:00'),
(2,  'VX-3C8RZT', 13, 1, '2026-10-19', '2026-10-24', 'Cape Town', 'Cape Town', 'active',
     'Child Seat (R 95/day), GPS Navigation (R 75/day)', 14750.00, 850.00, 15600.00, 'Heading up the West Coast.', '2026-10-12T11:32:00'),
(3,  'VX-9Q4WEA', 16, 7, '2026-10-18', '2026-10-21', 'Cape Town', 'Cape Town', 'active',
     '', 3750.00, 0.00, 3750.00, '', '2026-10-14T08:05:00'),
(4,  'VX-M5H2VX', 1, 6, '2026-10-25', '2026-10-27', 'Johannesburg', 'Johannesburg', 'confirmed',
     'Full Cover Insurance (R 250/day)', 33000.00, 500.00, 33500.00, 'Weekend experience booking.', '2026-10-18T15:47:00'),
(5,  'VX-T8N1QK', 6, 8, '2026-10-22', '2026-10-26', 'Cape Town', 'Durban', 'confirmed',
     '', 27400.00, 0.00, 27400.00, 'One-way rental with chauffeur handover.', '2026-10-16T10:20:00'),
(6,  'VX-B7Y3PL', 18, 5, '2026-10-21', '2026-10-25', 'Bloemfontein', 'Bloemfontein', 'pending',
     'Wi-Fi Hotspot (R 60/day)', 7400.00, 240.00, 7640.00, 'Farm access roads — confirm availability.', '2026-10-19T13:58:00'),
(7,  'VX-D6F9KS', 19, 2, '2026-10-23', '2026-10-29', 'Pretoria', 'Pretoria', 'pending',
     '', 9900.00, 0.00, 9900.00, '', '2026-10-20T07:41:00'),
(8,  'VX-Z2X8NM', 2, 6, '2026-09-10', '2026-09-14', 'Johannesburg', 'Johannesburg', 'completed',
     'Full Cover Insurance (R 250/day)', 63200.00, 1000.00, 64200.00, 'Anniversary weekend.', '2026-09-05T12:10:00'),
(9,  'VX-J4T7BH', 5, 3, '2026-08-11', '2026-08-15', 'Pretoria', 'Durban', 'completed',
     '', 19800.00, 0.00, 19800.00, 'One-way coastal trip.', '2026-08-06T16:44:00'),
(10, 'VX-P9W5VD', 20, 1, '2026-07-12', '2026-07-17', 'Cape Town', 'Cape Town', 'completed',
     'Additional Driver (R 150/day), Child Seat (R 95/day)', 12250.00, 1225.00, 13475.00, 'Family holiday — Garden Route.', '2026-07-06T09:27:00'),
(11, 'VX-K8M3RT', 15, 7, '2026-06-02', '2026-06-06', 'Gqeberha', 'Gqeberha', 'completed',
     '', 7400.00, 0.00, 7400.00, '', '2026-05-27T14:19:00'),
(12, 'VX-H6C2XW', 11, 4, '2026-05-03', '2026-05-08', 'Johannesburg', 'Johannesburg', 'completed',
     'Full Cover Insurance (R 250/day)', 14750.00, 1250.00, 16000.00, 'Sun City conference.', '2026-04-27T10:52:00'),
(13, 'VX-G1S9QE', 12, 8, '2026-09-30', '2026-10-04', 'Durban', 'Durban', 'cancelled',
     '', 10600.00, 0.00, 10600.00, 'Client cancelled — rescheduling.', '2026-09-25T11:36:00'),
(14, 'VX-U5V7LJ', 14, 3, '2026-10-28', '2026-11-01', 'Durban', 'Durban', 'confirmed',
     'GPS Navigation (R 75/day)', 5800.00, 300.00, 6100.00, 'iSimangaliso trip.', '2026-10-17T09:03:00');
SET IDENTITY_INSERT dbo.Bookings OFF;
GO

/* ---------------------------------------------------------------------------
   SAMPLE REPORTING QUERIES — highlight one and press F5 to run it
   --------------------------------------------------------------------------- */

-- 1. Fleet status overview
-- SELECT [Status], COUNT(*) AS Vehicles FROM dbo.Vehicles GROUP BY [Status];

-- 2. Revenue by month (excludes cancelled bookings), ZAR
-- SELECT FORMAT(CreatedAt, 'yyyy-MM') AS [Month],
--        COUNT(*) AS Bookings,
--        SUM(TotalAmount) AS RevenueZAR
-- FROM dbo.Bookings
-- WHERE [Status] <> 'cancelled'
-- GROUP BY FORMAT(CreatedAt, 'yyyy-MM')
-- ORDER BY [Month];

-- 3. Full booking register with joins
-- SELECT b.Reference, c.FullName, c.Email, v.Name AS Vehicle,
--        b.StartDate, b.EndDate, b.[Status], b.TotalAmount
-- FROM dbo.Bookings b
-- JOIN dbo.Customers c ON c.Id = b.CustomerId
-- JOIN dbo.Vehicles  v ON v.Id = b.VehicleId
-- ORDER BY b.CreatedAt DESC;

-- 4. Top-earning vehicles
-- SELECT TOP 5 v.Name, COUNT(b.Id) AS Rentals, SUM(b.TotalAmount) AS RevenueZAR
-- FROM dbo.Vehicles v
-- JOIN dbo.Bookings b ON b.VehicleId = v.Id AND b.[Status] <> 'cancelled'
-- GROUP BY v.Name
-- ORDER BY RevenueZAR DESC;
GO

PRINT 'VelocityRentals database created and seeded successfully.';
GO
