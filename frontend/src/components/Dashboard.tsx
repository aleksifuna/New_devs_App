import React, { useEffect, useState } from "react";
import { RevenueSummary } from "./RevenueSummary";
import { SecureAPI } from "../lib/secureApi";
import { useAppContext } from "../contexts/AppContext";

interface Property {
  id: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAppContext();
  const tenantId = user?.tenant_id || null;
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState('');

  useEffect(() => {
    if (!tenantId) {
      setProperties([]);
      setSelectedProperty('');
      setPropertiesLoading(false);
      return;
    }

    let cancelled = false;
    setPropertiesLoading(true);
    setPropertiesError('');

    SecureAPI.getDashboardProperties(tenantId)
      .then((loadedProperties) => {
        if (cancelled) return;
        setProperties(loadedProperties);
        setSelectedProperty(loadedProperties[0]?.id || '');
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setProperties([]);
        setSelectedProperty('');
        setPropertiesError('Failed to load properties');
      })
      .finally(() => {
        if (!cancelled) setPropertiesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  return (
    <div className="p-4 lg:p-6 min-h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Property Management Dashboard</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">Revenue Overview</h2>
                <p className="text-sm lg:text-base text-gray-600">
                  Monthly performance insights for your properties
                </p>
              </div>
              
              {/* Property Selector */}
              <div className="flex flex-col sm:items-end">
                <label className="text-xs font-medium text-gray-700 mb-1">Select Property</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="block w-full sm:w-auto min-w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {propertiesLoading && <p className="text-sm text-gray-600">Loading properties...</p>}
            {propertiesError && <p className="text-sm text-red-600">{propertiesError}</p>}
            {!propertiesLoading && !propertiesError && !properties.length && (
              <p className="text-sm text-gray-600">No properties found.</p>
            )}
            {!propertiesLoading && !propertiesError && selectedProperty && (
              <RevenueSummary propertyId={selectedProperty} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
