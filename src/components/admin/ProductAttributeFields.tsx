import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { CategoryAttribute } from "@/lib/catalog-attributes-api";

type ProductAttributeFieldsProps = {
  attributes: CategoryAttribute[];
  values: Record<string, string[]>;
  onChange: (values: Record<string, string[]>) => void;
  variantManagedKeys?: string[];
};

export function ProductAttributeFields({
  attributes,
  values,
  onChange,
  variantManagedKeys = [],
}: ProductAttributeFieldsProps) {
  const safeAttributes = attributes.filter((association) => association?.attributeDefinition?.key);

  if (!safeAttributes.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun attribut configuré pour cette catégorie.
      </p>
    );
  }

  const setValue = (key: string, next: string[]) => {
    onChange({ ...values, [key]: next.filter(Boolean) });
  };

  const toggleValue = (key: string, value: string) => {
    const current = values[key] ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setValue(key, next);
  };
  const normalizeKey = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  const managedKeys = new Set(variantManagedKeys.map(normalizeKey));
  if (managedKeys.has("color")) {
    ["colour", "couleur", "teinte"].forEach((key) => managedKeys.add(key));
  }

  return (
    <div className="space-y-5">
      {safeAttributes.map((association) => {
        const definition = association.attributeDefinition;
        const current = values[definition.key] ?? [];
        const managedByVariants = [definition.key, definition.label].some((value) =>
          managedKeys.has(normalizeKey(value)),
        );
        const required = association.required && !managedByVariants;
        const activeOptions = (definition.options ?? []).filter(
          (option) => option.isActive && (option.label || option.value),
        );

        return (
          <div key={association.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm">
                {definition.label}
                {required ? <span className="text-destructive"> *</span> : null}
                {managedByVariants ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    renseigné par les variantes
                  </span>
                ) : null}
              </Label>
              {current.length > 0 && (
                <button
                  type="button"
                  onClick={() => setValue(definition.key, [])}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Effacer
                </button>
              )}
            </div>

            {definition.type === "TEXT" && (
              <Input
                value={current[0] ?? ""}
                required={required}
                onChange={(event) => setValue(definition.key, [event.target.value])}
              />
            )}

            {definition.type === "NUMBER" && (
              <Input
                type="number"
                value={current[0] ?? ""}
                required={required}
                onChange={(event) => setValue(definition.key, [event.target.value])}
              />
            )}

            {definition.type === "BOOLEAN" && (
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-sm text-muted-foreground">
                  {current[0] === "true" ? "Oui" : "Non"}
                </span>
                <Switch
                  checked={current[0] === "true"}
                  onCheckedChange={(checked) => setValue(definition.key, [String(checked)])}
                />
              </div>
            )}

            {definition.type === "SELECT" && (
              <Select
                value={current[0] ?? ""}
                required={required}
                onValueChange={(value) => setValue(definition.key, [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {activeOptions.map((option) => {
                    const optionValue = option.label || option.value;
                    return (
                      <SelectItem key={option.id || optionValue} value={optionValue}>
                        {option.label || option.value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            {definition.type === "MULTI_SELECT" && (
              <div className="flex flex-wrap gap-2">
                {activeOptions.map((option) => {
                  const optionValue = option.label || option.value;
                  const checked = current.includes(optionValue);
                  return (
                    <label
                      key={option.id || optionValue}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition ${
                        checked
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleValue(definition.key, optionValue)}
                        className="sr-only"
                      />
                      {option.label || option.value}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
