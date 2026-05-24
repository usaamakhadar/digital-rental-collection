-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_cron (optional, wrapped so it doesn't fail if not supported)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron extension could not be installed. Scheduled billing must be triggered via cron trigger API or manual dashboard buttons.';
END;
$$;

-- Drop existing tables to establish clean schema
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS landlords CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 1. Organizations (Multi-tenant Accounts)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Landlords (Mapped to Auth Users)
CREATE TABLE landlords (
  id UUID PRIMARY KEY, -- References auth.users
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Properties (Real Estate Complexes)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Units (Rental Space details)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_number VARCHAR(100) NOT NULL,
  rent_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'VACANT' CHECK (status IN ('VACANT', 'OCCUPIED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tenants (Customers)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Leases (Agreements)
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TERMINATED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Invoices (Rent Billing)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
  due_date DATE NOT NULL,
  
  -- Snapshots for financial reporting integrity
  rent_amount_snapshot NUMERIC(12, 2) NOT NULL,
  tenant_name_snapshot VARCHAR(255) NOT NULL,
  unit_name_snapshot VARCHAR(255) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Payments (Revenue Logs)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL, -- 'ZAAD', 'EDAHAB', 'CASH'
  provider_transaction_id VARCHAR(255) UNIQUE, -- Idempotency protection key
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Expenses (Operating costs)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(50) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Audit Logs (SaaS Compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Database Indexes for high scalability
CREATE INDEX idx_properties_org ON properties(organization_id);
CREATE INDEX idx_units_org ON units(organization_id);
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_tenants_org ON tenants(organization_id);
CREATE INDEX idx_tenants_phone ON tenants(phone);
CREATE INDEX idx_leases_org ON leases(organization_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_lease ON invoices(lease_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date);
CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_txn ON payments(provider_transaction_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);


-- Helper: Get current user organization_id securely
CREATE OR REPLACE FUNCTION get_user_org_id() 
RETURNS UUID AS $$
  SELECT organization_id FROM landlords WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- Row Level Security (RLS) policies
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Landlord Policy (a user manages their own account profile)
CREATE POLICY landlords_policy ON landlords FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Core Tables Policies (filtered by current user's organization_id)
CREATE POLICY properties_policy ON properties FOR ALL TO authenticated
  USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY units_policy ON units FOR ALL TO authenticated
  USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY tenants_policy ON tenants FOR ALL TO authenticated
  USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY leases_policy ON leases FOR ALL TO authenticated
  USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY invoices_policy ON invoices FOR ALL TO authenticated
  USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY payments_policy ON payments FOR ALL TO authenticated
  USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY audit_logs_policy ON audit_logs FOR ALL TO authenticated
  USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());


-- Audit Logging Database Trigger
CREATE OR REPLACE FUNCTION process_audit_log() 
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_org_id := OLD.organization_id;
  ELSE
    v_org_id := NEW.organization_id;
  END IF;

  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    v_org_id,
    v_user_id,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
  );
  
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Audit Log Triggers
CREATE TRIGGER audit_leases_trigger AFTER INSERT OR UPDATE OR DELETE ON leases
  FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_invoices_trigger AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_payments_trigger AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION process_audit_log();


-- Business Logic Database Procedures (RPCs)

-- Stored Procedure 1: Atomic payment webhook and invoice processing
DROP FUNCTION IF EXISTS public.process_payment(UUID, NUMERIC, varchar, varchar, UUID);
DROP FUNCTION IF EXISTS public.process_payment(UUID, NUMERIC, text, text, UUID);

CREATE OR REPLACE FUNCTION process_payment(
  p_invoice_id UUID,
  p_amount NUMERIC,
  p_transaction_id TEXT,
  p_method TEXT,
  p_landlord_id UUID
) RETURNS VOID AS $$
DECLARE
  v_org_id UUID;
  v_currency VARCHAR(3);
BEGIN
  -- Obtain organization_id and currency_code from landlords/invoices
  SELECT organization_id INTO v_org_id FROM landlords WHERE id = p_landlord_id;
  SELECT currency_code INTO v_currency FROM invoices WHERE id = p_invoice_id;

  -- Safeguard: Ensure invoice is not already paid
  IF EXISTS (SELECT 1 FROM invoices WHERE id = p_invoice_id AND status = 'PAID') THEN
    RAISE EXCEPTION 'Invoice is already paid';
  END IF;

  -- Create payment record
  INSERT INTO payments (
    organization_id,
    invoice_id,
    amount,
    currency_code,
    payment_method,
    provider_transaction_id,
    paid_at
  ) VALUES (
    v_org_id,
    p_invoice_id,
    p_amount,
    v_currency,
    p_method,
    p_transaction_id,
    now()
  );

  -- Mark invoice as PAID
  UPDATE invoices
  SET status = 'PAID'
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Stored Procedure 2: Generate monthly invoices for all active leases across all organizations
CREATE OR REPLACE FUNCTION generate_all_monthly_invoices() 
RETURNS INTEGER AS $$
DECLARE
  v_lease RECORD;
  v_invoice_count INTEGER := 0;
  v_due_date DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
BEGIN
  FOR v_lease IN 
    SELECT l.id AS lease_id, l.organization_id, u.rent_amount, t.name AS tenant_name, u.unit_number
    FROM leases l
    JOIN units u ON l.unit_id = u.id
    JOIN tenants t ON l.tenant_id = t.id
    WHERE l.status = 'ACTIVE'
  LOOP
    -- Verify no invoice exists for this lease for current month
    IF NOT EXISTS (
      SELECT 1 FROM invoices 
      WHERE lease_id = v_lease.lease_id 
        AND DATE_TRUNC('month', due_date) = DATE_TRUNC('month', CURRENT_DATE)
    ) THEN
      INSERT INTO invoices (
        organization_id, 
        lease_id, 
        amount, 
        status, 
        due_date, 
        rent_amount_snapshot, 
        tenant_name_snapshot, 
        unit_name_snapshot
      ) VALUES (
        v_lease.organization_id, 
        v_lease.lease_id, 
        v_lease.rent_amount, 
        'PENDING', 
        v_due_date, 
        v_lease.rent_amount, 
        v_lease.tenant_name, 
        v_lease.unit_number
      );
      v_invoice_count := v_invoice_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_invoice_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Stored Procedure 3: Manually run invoice generator for a single organization
CREATE OR REPLACE FUNCTION generate_monthly_invoices(p_org_id UUID) 
RETURNS INTEGER AS $$
DECLARE
  v_lease RECORD;
  v_invoice_count INTEGER := 0;
  v_due_date DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
BEGIN
  FOR v_lease IN 
    SELECT l.id AS lease_id, u.rent_amount, t.name AS tenant_name, u.unit_number
    FROM leases l
    JOIN units u ON l.unit_id = u.id
    JOIN tenants t ON l.tenant_id = t.id
    WHERE l.organization_id = p_org_id AND l.status = 'ACTIVE'
  LOOP
    -- Verify no invoice exists for this lease for current month
    IF NOT EXISTS (
      SELECT 1 FROM invoices 
      WHERE lease_id = v_lease.lease_id 
        AND DATE_TRUNC('month', due_date) = DATE_TRUNC('month', CURRENT_DATE)
    ) THEN
      INSERT INTO invoices (
        organization_id, 
        lease_id, 
        amount, 
        status, 
        due_date, 
        rent_amount_snapshot, 
        tenant_name_snapshot, 
        unit_name_snapshot
      ) VALUES (
        p_org_id, 
        v_lease.lease_id, 
        v_lease.rent_amount, 
        'PENDING', 
        v_due_date, 
        v_lease.rent_amount, 
        v_lease.tenant_name, 
        v_lease.unit_number
      );
      v_invoice_count := v_invoice_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_invoice_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Stored Procedure 4: Flags past-due pending invoices as OVERDUE
CREATE OR REPLACE FUNCTION update_overdue_invoices() 
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE invoices
  SET status = 'OVERDUE'
  WHERE status = 'PENDING' AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Set up scheduled automated cron tasks (if pg_cron is enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Run invoice generator at 00:00 on the 1st of every month
    PERFORM cron.schedule(
      'monthly-rent-billing',
      '0 0 1 * *',
      $cron$ SELECT generate_all_monthly_invoices() $cron$
    );
    
    -- Run overdue check daily at 00:05
    PERFORM cron.schedule(
      'daily-overdue-flagging',
      '5 0 * * *',
      $cron$ SELECT update_overdue_invoices() $cron$
    );
  END IF;
END;
$$;

