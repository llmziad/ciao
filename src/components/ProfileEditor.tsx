"use client";

import { useFormState } from "react-dom";
import { saveProfileAction } from "@/app/dashboard/actions";
import { emptyFormState } from "@/lib/form";
import { SubmitButton } from "@/components/SubmitButton";
import { PhotoUploader } from "@/components/PhotoUploader";
import { QrPanel } from "@/components/QrPanel";
import { InfoTooltip } from "@/components/InfoTooltip";

type EditorProfile = {
  userId: string;
  slug: string;
  name: string;
  title: string | null;
  phone: string | null;
  address: string | null;
  photoUrl: string | null;
  socialInstagram: string | null;
  socialTwitter: string | null;
  socialFacebook: string | null;
  socialLinkedin: string | null;
};

function Field({
  label,
  name,
  defaultValue,
  error,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className="input"
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function ProfileEditor({
  profile,
  publicUrl,
  heading = "My profile",
}: {
  profile: EditorProfile;
  publicUrl: string;
  heading?: string;
}) {
  const [state, action] = useFormState(saveProfileAction, emptyFormState);
  const fe = state.fieldErrors ?? {};

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <form action={action} className="card p-6">
        <input type="hidden" name="userId" value={profile.userId} />
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-icao-navy">{heading}</h1>
          {state.ok && state.message && (
            <span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              {state.message}
            </span>
          )}
        </div>

        <div className="mt-6 border-b border-line pb-6">
          <PhotoUploader userId={profile.userId} name={profile.name} photoUrl={profile.photoUrl} />
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Name" name="name" defaultValue={profile.name} error={fe.name} required />
          <Field
            label="Title / role"
            name="title"
            defaultValue={profile.title}
            error={fe.title}
            placeholder="Aviation Security Officer"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone}
              error={fe.phone}
              placeholder="+1 514 555 0100"
            />
            <Field
              label="Address"
              name="address"
              defaultValue={profile.address}
              error={fe.address}
              placeholder="999 Robert-Bourassa Blvd, Montréal"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-ink">Social links</h3>
              <InfoTooltip text="Paste a full profile URL (e.g. https://instagram.com/you) and we'll use it as-is — or just enter your @username and we'll build the correct link for you." />
            </div>
            <p className="hint">Optional. Enter a full URL or just your @username.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram" name="instagram" defaultValue={profile.socialInstagram} error={fe.instagram} placeholder="@username" />
            <Field label="Twitter / X" name="twitter" defaultValue={profile.socialTwitter} error={fe.twitter} placeholder="@username" />
            <Field label="Facebook" name="facebook" defaultValue={profile.socialFacebook} error={fe.facebook} placeholder="facebook.com/username" />
            <Field label="LinkedIn" name="linkedin" defaultValue={profile.socialLinkedin} error={fe.linkedin} placeholder="linkedin.com/in/username" />
          </div>
        </div>

        {state.error && (
          <div className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
            {state.error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <SubmitButton className="btn-primary" pendingText="Saving…">
            Save profile
          </SubmitButton>
        </div>
      </form>

      <div>
        <QrPanel slug={profile.slug} publicUrl={publicUrl} />
      </div>
    </div>
  );
}
