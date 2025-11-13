import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Divider,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  EmptyState
} from '@hubspot/ui-extensions';

export const DealHistory = ({ deals, onSelectDeal }) => {
  const [collapsed, setCollapsed] = useState(true);

  if (!deals || deals.length === 0) {
    return (
      <Box>
        <Text format={{ fontWeight: 'bold' }}>Deal History</Text>
        <Divider distance="small" />
        <EmptyState
          title="No Previous Deals"
          layout="vertical"
        >
          <Text>No closed-won SPEX deals found for this company</Text>
        </EmptyState>
      </Box>
    );
  }

  return (
    <Box>
      <Flex direction="row" justify="between" align="center">
        <Text format={{ fontWeight: 'bold' }}>
          Deal History ({deals.length})
        </Text>
        <Button
          onClick={() => setCollapsed(!collapsed)}
          variant="secondary"
          size="xs"
        >
          {collapsed ? 'Show' : 'Hide'}
        </Button>
      </Flex>
      <Divider distance="small" />

      {!collapsed && (
        <Box marginTop="sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Deal Name</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Close Date</TableHeader>
                <TableHeader>Action</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <Text>{deal.dealname || 'Unnamed Deal'}</Text>
                  </TableCell>
                  <TableCell>
                    <Text>
                      {deal.amount
                        ? `$${parseFloat(deal.amount).toLocaleString()}`
                        : '-'}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text>
                      {deal.closedate
                        ? new Date(deal.closedate).toLocaleDateString()
                        : '-'}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => onSelectDeal(deal)}
                      variant="secondary"
                      size="xs"
                    >
                      Use Template
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};
