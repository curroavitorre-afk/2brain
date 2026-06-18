import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nrcadwzjbagctysiiqml.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yY2Fkd3pqYmFnY3R5c2lpcW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTMxNzYsImV4cCI6MjA5NzM2OTE3Nn0.qpXTc5XRMSdlK51tAFu8uJ3Zo4sldFxB0Ney_w6WIOM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
