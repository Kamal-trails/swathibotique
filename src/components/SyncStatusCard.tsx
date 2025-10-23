/**
 * Sync Status Card - Shows product-inventory synchronization status
 * Following Single Responsibility Principle - only handles sync status display
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  validateSync, 
  autoFixSync, 
  SyncInconsistency 
} from '@/services/productInventorySync';
import { toast } from 'sonner';

const SyncStatusCard = () => {
  const [inconsistencies, setInconsistencies] = useState<SyncInconsistency[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Validate sync on mount
  useEffect(() => {
    checkSync();
  }, []);

  const checkSync = () => {
    setIsValidating(true);
    try {
      const issues = validateSync();
      setInconsistencies(issues);
      setLastChecked(new Date());
      
      if (issues.length === 0) {
        toast.success('All products and inventory are in sync!');
      } else {
        toast.warning(`Found ${issues.length} synchronization issue(s)`);
      }
    } catch (error) {
      console.error('Error validating sync:', error);
      toast.error('Failed to validate synchronization');
    } finally {
      setIsValidating(false);
    }
  };

  const handleAutoFix = async () => {
    setIsFixing(true);
    try {
      const result = autoFixSync();
      
      if (result.fixed > 0) {
        toast.success(`Fixed ${result.fixed} synchronization issue(s)!`);
      }
      
      if (result.errors > 0) {
        toast.error(`${result.errors} error(s) occurred during auto-fix`);
      }
      
      // Re-validate after fixing
      setTimeout(() => checkSync(), 500);
    } catch (error) {
      console.error('Error auto-fixing:', error);
      toast.error('Failed to auto-fix issues');
    } finally {
      setIsFixing(false);
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'missing_inventory':
      case 'missing_product':
        return 'destructive';
      case 'stock_mismatch':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {inconsistencies.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              Product-Inventory Sync Status
            </CardTitle>
            <CardDescription>
              {lastChecked && `Last checked: ${lastChecked.toLocaleTimeString()}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkSync}
              disabled={isValidating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              Check
            </Button>
            {inconsistencies.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleAutoFix}
                disabled={isFixing}
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  'Auto-Fix'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {inconsistencies.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>All products and inventory are synchronized</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium mb-3">
              Found {inconsistencies.length} issue(s):
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inconsistencies.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-2 border rounded-lg">
                  <Badge variant={getSeverityColor(issue.type)}>
                    {issue.type.replace(/_/g, ' ')}
                  </Badge>
                  <p className="text-sm flex-1">{issue.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SyncStatusCard;

