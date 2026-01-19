import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AssetTable from '@/app/components/asset-table';
import { assets } from '@/lib/data';

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">New SIMANJA</h1>
        <p className="text-muted-foreground">Welcome to your new Asset Management System.</p>
      </header>
      <main>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Assets</CardTitle>
              <CardDescription>A list of all assets in your inventory.</CardDescription>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <AssetTable assets={assets} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
