export type Asset = {
    id: string;
    name: string;
    category: string;
    status: 'Assigned' | 'Available' | 'In Repair' | 'Decommissioned';
    location: string;
    purchaseDate: string;
    cost: number;
    condition: 'New' | 'Good' | 'Fair' | 'Poor';
};

export const assets: Asset[] = [
    {
        id: 'N-SIM-001',
        name: 'MacBook Pro 16"',
        category: 'Laptop',
        status: 'Assigned',
        location: 'Andi Wijaya',
        purchaseDate: '2023-01-15',
        cost: 3200,
        condition: 'Good',
    },
    {
        id: 'N-SIM-002',
        name: 'Dell UltraSharp U2721DE',
        category: 'Monitor',
        status: 'Available',
        location: 'Storage Room A',
        purchaseDate: '2022-11-20',
        cost: 650,
        condition: 'New',
    },
    {
        id: 'N-SIM-003',
        name: 'Logitech MX Master 3',
        category: 'Mouse',
        status: 'Assigned',
        location: 'Budi Santoso',
        purchaseDate: '2023-03-10',
        cost: 100,
        condition: 'Good',
    },
    {
        id: 'N-SIM-004',
        name: 'iPhone 14 Pro',
        category: 'Phone',
        status: 'In Repair',
        location: 'Service Center',
        purchaseDate: '2023-02-01',
        cost: 1100,
        condition: 'Fair',
    },
    {
        id: 'N-SIM-005',
        name: 'Herman Miller Aeron',
        category: 'Chair',
        status: 'Assigned',
        location: 'Citra Lestari',
        purchaseDate: '2022-09-05',
        cost: 1400,
        condition: 'Good',
    },
    {
        id: 'N-SIM-006',
        name: 'Canon EOS R6',
        category: 'Camera',
        status: 'Available',
        location: 'Media Closet',
        purchaseDate: '2023-05-22',
        cost: 2500,
        condition: 'New',
    },
    {
        id: 'N-SIM-007',
        name: 'iPad Pro 12.9"',
        category: 'Tablet',
        status: 'Decommissioned',
        location: 'Recycling',
        purchaseDate: '2021-08-15',
        cost: 1200,
        condition: 'Poor',
    }
];
