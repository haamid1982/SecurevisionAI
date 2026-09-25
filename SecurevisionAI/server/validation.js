import {z} from 'zod';

export const customerInput=z.object({
  companyName:z.string().trim().min(2).max(160),
  contactName:z.string().trim().min(2).max(120),
  email:z.string().trim().email(),
  phone:z.string().trim().max(40).optional().default(''),
  status:z.enum(['Active','Lead','Inactive']).default('Lead'),
  address:z.string().trim().max(300).optional().default(''),
});

export const jobInput=z.object({
  customerId:z.string().uuid(),
  siteId:z.string().uuid().nullable().optional().default(null),
  title:z.string().trim().min(3).max(180),
  description:z.string().trim().max(4000).optional().default(''),
  engineerName:z.string().trim().max(120).optional().default('Unassigned'),
  engineerUid:z.string().trim().max(128).nullable().optional().default(null),
  jobType:z.enum(['Survey','Installation','Maintenance','Repair','Inspection','Emergency','Other']).optional().default('Installation'),
  scheduledStart:z.string().datetime({offset:true}).nullable().optional().default(null),
  scheduledEnd:z.string().datetime({offset:true}).nullable().optional().default(null),
  dueDate:z.coerce.date(),
  status:z.enum(['Pending','Scheduled','In Progress','Completed','Cancelled']).default('Pending'),
  priority:z.enum(['Low','Medium','High','Urgent']).default('Medium'),
});

export const jobStatusInput=z.object({status:z.enum(['Pending','Scheduled','In Progress','Completed','Cancelled'])});
export const jobScheduleInput=z.object({siteId:z.string().uuid().nullable().optional().default(null),engineerUid:z.string().trim().max(128).nullable().optional().default(null),engineerId:z.string().uuid().nullable().optional().default(null),scheduledStart:z.string().datetime({offset:true}).nullable(),scheduledEnd:z.string().datetime({offset:true}).nullable()});
export const jobNoteInput=z.object({body:z.string().trim().min(1).max(4000)});
const checklistItem=z.object({label:z.string().trim().min(1).max(240),checked:z.boolean()});
const equipmentItem=z.object({description:z.string().trim().min(1).max(240),manufacturer:z.string().trim().max(120).optional().default(''),model:z.string().trim().max(120).optional().default(''),serialNumber:z.string().trim().max(160).optional().default(''),quantity:z.coerce.number().int().positive().max(1000).default(1)});
export const jobCompletionInput=z.object({checklist:z.array(checklistItem).max(50),equipment:z.array(equipmentItem).max(100),workSummary:z.string().trim().max(10000).optional().default(''),furtherWorkRequired:z.string().trim().max(5000).optional().default(''),customerName:z.string().trim().max(160).optional().default(''),customerSignature:z.string().startsWith('data:image/png;base64,').max(500000).nullable().optional().default(null)});
const lineItem=z.object({description:z.string().trim().min(2).max(300),quantity:z.coerce.number().positive().max(100000),unitPrice:z.coerce.number().min(0).max(10000000)});
export const quoteInput=z.object({customerId:z.string().uuid(),siteId:z.string().uuid().nullable().optional().default(null),title:z.string().trim().min(3).max(180),validUntil:z.string().date().nullable().optional().default(null),discount:z.coerce.number().min(0).default(0),vatRate:z.coerce.number().min(0).max(100).default(20),notes:z.string().trim().max(4000).optional().default(''),items:z.array(lineItem).min(1).max(100)});
export const quoteStatusInput=z.object({status:z.enum(['Draft','Sent','Accepted','Rejected','Expired'])});
export const quoteJobInput=z.object({
  engineerId:z.string().uuid().nullable().optional().default(null),
  dueDate:z.string().date(),
  scheduledStart:z.string().datetime({offset:true}).nullable().optional().default(null),
  scheduledEnd:z.string().datetime({offset:true}).nullable().optional().default(null),
  priority:z.enum(['Low','Medium','High','Urgent']).default('Medium'),
}).refine(value=>Boolean(value.scheduledStart)===Boolean(value.scheduledEnd),{message:'Provide both the start and end time.'}).refine(value=>!value.scheduledStart||new Date(value.scheduledEnd)>new Date(value.scheduledStart),{message:'The end time must be after the start time.'});
export const paymentInput=z.object({amount:z.coerce.number().positive(),method:z.enum(['Bank Transfer','Card','Cash','Cheque','Other']).default('Bank Transfer'),reference:z.string().trim().max(100).optional().default(''),paidAt:z.string().date().optional()});

export const companyInput=z.object({
  name:z.string().trim().min(2).max(160),
  email:z.string().trim().email().or(z.literal('')),
  phone:z.string().trim().max(40).optional().default(''),
  website:z.string().trim().max(300).optional().default(''),
  address:z.string().trim().max(300).optional().default(''),
  timezone:z.string().trim().max(80).optional().default('Europe/London'),
  currency:z.string().trim().length(3).transform(value=>value.toUpperCase()).optional().default('GBP'),
  services:z.array(z.string().trim().min(2).max(100)).min(1).max(20),
});

export const accountInput=z.object({
  fullName:z.string().trim().min(2).max(120),
});

export const billingInput=z.object({
  plan:z.enum(['Starter','Professional','Enterprise']),
  billingEmail:z.string().trim().email(),
  purchaseOrderReference:z.string().trim().max(100).optional().default(''),
});

export const invitationInput=z.object({
  email:z.string().trim().email(),
  fullName:z.string().trim().max(120).optional().default(''),
  role:z.enum(['admin','engineer','customer']),
});

export const memberUpdateInput=z.object({
  role:z.enum(['admin','engineer','customer']).optional(),
  isActive:z.boolean().optional(),
}).refine(value=>value.role!==undefined||value.isActive!==undefined,{message:'Provide a role or active status.'});

export const engineerInput=z.object({
  fullName:z.string().trim().min(2).max(160),
  email:z.string().trim().email(),
  phone:z.string().trim().max(40).optional().default(''),
  jobTitle:z.string().trim().min(2).max(160).optional().default('Security Engineer'),
  skills:z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
});

export const customerPortalInviteInput=z.object({email:z.string().trim().email(),fullName:z.string().trim().min(2).max(160)});
export const serviceRequestInput=z.object({siteId:z.string().uuid().nullable().optional().default(null),subject:z.string().trim().min(3).max(180),description:z.string().trim().min(10).max(5000),priority:z.enum(['Low','Normal','High','Urgent']).default('Normal')});
export const serviceRequestUpdateInput=z.object({status:z.enum(['Submitted','Reviewing','Scheduled','Resolved','Closed']),priority:z.enum(['Low','Normal','High','Urgent'])});
export const serviceRequestJobInput=z.object({engineerId:z.string().uuid().nullable().optional().default(null),dueDate:z.string().date(),scheduledStart:z.string().datetime({offset:true}).nullable().optional().default(null),scheduledEnd:z.string().datetime({offset:true}).nullable().optional().default(null)}).refine(value=>Boolean(value.scheduledStart)===Boolean(value.scheduledEnd),{message:'Provide both schedule times.'}).refine(value=>!value.scheduledStart||new Date(value.scheduledEnd)>new Date(value.scheduledStart),{message:'The end time must be after the start time.'});
export const inventoryItemInput=z.object({sku:z.string().trim().min(1).max(80),name:z.string().trim().min(2).max(180),category:z.enum(['CCTV','Intruder Alarm','Access Control','Fire Detection','Networking','Electrical','Cable','Consumables','Tools','Other']).default('Other'),manufacturer:z.string().trim().max(120).optional().default(''),supplier:z.string().trim().max(160).optional().default(''),supplierEmail:z.string().trim().email().or(z.literal('')).optional().default(''),unitCost:z.coerce.number().min(0).max(10000000),salePrice:z.coerce.number().min(0).max(10000000),quantity:z.coerce.number().int().min(0).max(1000000),reorderLevel:z.coerce.number().int().min(0).max(1000000),location:z.string().trim().max(160).optional().default('')});
export const inventoryMovementInput=z.object({movementType:z.enum(['Received','Used','Adjustment','Returned']),quantityChange:z.coerce.number().int().min(-100000).max(100000).refine(value=>value!==0),reference:z.string().trim().max(160).optional().default(''),notes:z.string().trim().max(2000).optional().default('')});

export const assistantInput=z.object({
  prompt:z.string().trim().min(3).max(1000),
});

export const publicContactInput=z.object({
  fullName:z.string().trim().min(2).max(120),
  companyName:z.string().trim().max(160).optional().default(''),
  email:z.string().trim().email().max(254),
  phone:z.string().trim().max(40).optional().default(''),
  subject:z.string().trim().min(3).max(180),
  message:z.string().trim().min(10).max(5000),
  website:z.string().max(0).optional().default(''),
});

export const aiQuoteDraftInput=z.object({
  customerId:z.string().uuid(),
  siteId:z.string().uuid().nullable().optional().default(null),
  brief:z.string().trim().min(20).max(5000),
});

export const aiReportDraftInput=z.object({
  checklist:z.array(checklistItem).max(50).default([]),
  equipment:z.array(equipmentItem).max(100).default([]),
  engineerObservations:z.string().trim().max(5000).optional().default(''),
});

export const contactInput=z.object({fullName:z.string().trim().min(2).max(120),jobTitle:z.string().trim().max(120).optional().default(''),email:z.string().trim().email().or(z.literal('')).optional().default(''),phone:z.string().trim().max(40).optional().default(''),contactType:z.enum(['General','Site','Accounts','Technical','Emergency']).default('General'),isPrimary:z.boolean().optional().default(false)});
export const siteInput=z.object({name:z.string().trim().min(2).max(160),address:z.string().trim().min(3).max(300),postcode:z.string().trim().max(20).optional().default(''),accessInstructions:z.string().trim().max(2000).optional().default(''),openingHours:z.string().trim().max(200).optional().default(''),notes:z.string().trim().max(4000).optional().default('')});
export const assetInput=z.object({siteId:z.string().uuid().nullable().optional().default(null),systemType:z.enum(['CCTV','Intruder Alarm','Access Control','Fire Detection','Intercom','Networking','Audio Visual','Electrical','Other']),manufacturer:z.string().trim().max(100).optional().default(''),model:z.string().trim().max(100).optional().default(''),serialNumber:z.string().trim().max(120).optional().default(''),installedAt:z.string().date().nullable().optional().default(null),warrantyExpiresAt:z.string().date().nullable().optional().default(null),maintenanceDueAt:z.string().date().nullable().optional().default(null),notes:z.string().trim().max(4000).optional().default('')});

export function validate(schema){return(req,res,next)=>{const result=schema.safeParse(req.body);if(!result.success)return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'The submitted data is invalid.',details:result.error.flatten().fieldErrors}});req.validated=result.data;next();};}
