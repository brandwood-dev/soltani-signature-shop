import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  assignAdminCategoryAttribute,
  createAdminAttributeDefinition,
  createAdminAttributeOption,
  deleteAdminAttributeDefinition,
  deleteAdminAttributeOption,
  deleteAdminCategoryAttribute,
  getAdminAttributeDefinitions,
  getAdminAttributeDefinitionsPage,
  getAdminCategoryAttributes,
  reorderAdminAttributeDefinitions,
  reorderAdminAttributeOptions,
  reorderAdminCategoryAttributes,
  toggleAdminAttributeDefinition,
  toggleAdminAttributeOption,
  updateAdminAttributeDefinition,
  updateAdminAttributeOption,
  updateAdminCategoryAttribute,
  type AttributeDefinition,
  type AttributeOption,
  type AttributeType,
  type CategoryAttribute,
} from "@/lib/catalog-attributes-api";
import { fallbackCategoryTree, loadCategoryTree, type CategoryTree } from "@/lib/categories-api";

export const Route = createFileRoute("/admin/attributes")({
  component: AdminAttributes,
});

const ATTRIBUTE_TYPES: Array<{ value: AttributeType; label: string }> = [
  { value: "TEXT", label: "Texte" },
  { value: "NUMBER", label: "Nombre" },
  { value: "BOOLEAN", label: "Oui / Non" },
  { value: "SELECT", label: "Choix unique" },
  { value: "MULTI_SELECT", label: "Choix multiple" },
];

const ATTRIBUTE_PAGE_SIZE = 8;
const OPTION_ATTRIBUTE_TYPES: AttributeType[] = ["SELECT", "MULTI_SELECT"];

function supportsOptions(type: AttributeType) {
  return OPTION_ATTRIBUTE_TYPES.includes(type);
}

type DefinitionForm = {
  id?: string;
  key: string;
  label: string;
  type: AttributeType;
  sortOrder: string;
  isActive: boolean;
};

type OptionForm = {
  definitionId: string;
  option?: AttributeOption;
  value: string;
  label: string;
  sortOrder: string;
  isActive: boolean;
};

function AdminAttributes() {
  const [definitions, setDefinitions] = useState<AttributeDefinition[]>([]);
  const [allDefinitions, setAllDefinitions] = useState<AttributeDefinition[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>(fallbackCategoryTree());
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [definitionForm, setDefinitionForm] = useState<DefinitionForm | null>(null);
  const [optionForm, setOptionForm] = useState<OptionForm | null>(null);
  const [assignId, setAssignId] = useState("");
  const [assignRequired, setAssignRequired] = useState(false);
  const [assignFilterable, setAssignFilterable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("order");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: ATTRIBUTE_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [openDefinitionIds, setOpenDefinitionIds] = useState<Set<string>>(new Set());

  const flatCategories = useMemo(
    () =>
      categoryTree.flatMap((category) => [
        { id: category.id, label: category.name },
        ...category.subs.map((sub) => ({ id: sub.id, label: `${category.name} / ${sub.name}` })),
      ]),
    [categoryTree],
  );

  const refreshDefinitions = async () => {
    const response = await getAdminAttributeDefinitionsPage({
      page,
      pageSize: ATTRIBUTE_PAGE_SIZE,
      search,
      sort,
    });
    setDefinitions(response.definitions);
    setPagination(response.pagination);
    setOpenDefinitionIds((current) =>
      current.size ? current : new Set(response.definitions.slice(0, 1).map((item) => item.id)),
    );
  };

  const refreshAllDefinitions = async () => {
    const items = await getAdminAttributeDefinitions();
    setAllDefinitions(Array.isArray(items) ? items : []);
    return Array.isArray(items) ? items : [];
  };

  const refreshCategoryAttributes = async (categoryId = selectedCategoryId) => {
    if (!categoryId) {
      setCategoryAttributes([]);
      return [];
    }
    try {
      const items = await getAdminCategoryAttributes(categoryId);
      setCategoryAttributes(Array.isArray(items) ? items : []);
      return Array.isArray(items) ? items : [];
    } catch {
      setCategoryAttributes([]);
      return [];
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const [definitionsData, allDefinitionsData, categories] = await Promise.all([
        getAdminAttributeDefinitionsPage({
          page,
          pageSize: ATTRIBUTE_PAGE_SIZE,
          search,
          sort,
        }),
        getAdminAttributeDefinitions(),
        loadCategoryTree({ admin: true }),
      ]);
      setDefinitions(definitionsData.definitions);
      setAllDefinitions(Array.isArray(allDefinitionsData) ? allDefinitionsData : []);
      setPagination(definitionsData.pagination);
      setOpenDefinitionIds((current) =>
        current.size
          ? current
          : new Set(definitionsData.definitions.slice(0, 1).map((item) => item.id)),
      );
      setCategoryTree(categories.length ? categories : fallbackCategoryTree());
      const firstCategoryId = selectedCategoryId || categories[0]?.id || "";
      setSelectedCategoryId(firstCategoryId);
      if (firstCategoryId) {
        await refreshCategoryAttributes(firstCategoryId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les attributs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!loading) void refreshDefinitions();
  }, [page, search, sort]);

  const sortOptions = (options: AttributeOption[]) =>
    [...options].sort(
      (left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label),
    );

  const replaceDefinition = (definition: AttributeDefinition) => {
    setDefinitions((current) =>
      current.map((item) => (item.id === definition.id ? definition : item)),
    );
    setAllDefinitions((current) =>
      current.map((item) => (item.id === definition.id ? definition : item)),
    );
  };

  const upsertVisibleDefinition = (definition: AttributeDefinition) => {
    setDefinitions((current) => {
      const exists = current.some((item) => item.id === definition.id);
      const next = exists
        ? current.map((item) => (item.id === definition.id ? definition : item))
        : [definition, ...current];
      return next.slice(0, ATTRIBUTE_PAGE_SIZE);
    });
    setAllDefinitions((current) => {
      const exists = current.some((item) => item.id === definition.id);
      return exists
        ? current.map((item) => (item.id === definition.id ? definition : item))
        : [...current, definition];
    });
  };

  const patchDefinitionOptions = (
    definitionId: string,
    updater: (options: AttributeOption[]) => AttributeOption[],
  ) => {
    const updateDefinition = (definition: AttributeDefinition) =>
      definition.id === definitionId
        ? { ...definition, options: sortOptions(updater(definition.options)) }
        : definition;
    setDefinitions((current) => current.map(updateDefinition));
    setAllDefinitions((current) => current.map(updateDefinition));
    setCategoryAttributes((current) =>
      current.map((association) =>
        association.attributeDefinition.id === definitionId
          ? {
              ...association,
              attributeDefinition: updateDefinition(association.attributeDefinition),
            }
          : association,
      ),
    );
  };

  const openDefinition = (definition?: AttributeDefinition) => {
    setError("");
    setDefinitionForm({
      id: definition?.id,
      key: definition?.key ?? "",
      label: definition?.label ?? "",
      type: definition?.type ?? "SELECT",
      sortOrder: String(definition?.sortOrder ?? definitions.length),
      isActive: definition?.isActive ?? true,
    });
  };

  const openOption = (definition: AttributeDefinition, option?: AttributeOption) => {
    setError("");
    if (!supportsOptions(definition.type)) {
      setError("Ce type d'attribut n'utilise pas d'options.");
      return;
    }
    setOptionForm({
      definitionId: definition.id,
      option,
      value: option?.value ?? "",
      label: option?.label ?? "",
      sortOrder: String(option?.sortOrder ?? definition.options.length),
      isActive: option?.isActive ?? true,
    });
  };

  const saveDefinition = async () => {
    if (!definitionForm?.key.trim() || !definitionForm.label.trim()) {
      setError("La clé et le libellé sont obligatoires.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = {
        key: definitionForm.key.trim(),
        label: definitionForm.label.trim(),
        type: definitionForm.type,
        sortOrder: Number(definitionForm.sortOrder || 0),
        isActive: definitionForm.isActive,
      };
      const savedDefinition = definitionForm.id
        ? await updateAdminAttributeDefinition(definitionForm.id, payload)
        : await createAdminAttributeDefinition(payload);
      const isNewDefinition = !definitionForm.id;
      if (supportsOptions(savedDefinition.type)) {
        setOpenDefinitionIds((current) => new Set([...current, savedDefinition.id]));
      }
      setDefinitionForm(null);
      if (isNewDefinition) {
        setSearch(savedDefinition.label);
        setPage(1);
        upsertVisibleDefinition(savedDefinition);
      } else {
        replaceDefinition(savedDefinition);
        await refreshDefinitions();
      }
      await refreshAllDefinitions();
      await refreshCategoryAttributes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const saveOption = async () => {
    if (!optionForm?.value.trim() || !optionForm.label.trim()) {
      setError("La valeur et le libellé sont obligatoires.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = {
        value: optionForm.value.trim(),
        label: optionForm.label.trim(),
        sortOrder: Number(optionForm.sortOrder || 0),
        isActive: optionForm.isActive,
      };
      let savedOption: AttributeOption;
      if (optionForm.option) {
        savedOption = await updateAdminAttributeOption(
          optionForm.definitionId,
          optionForm.option.id,
          payload,
        );
      } else {
        savedOption = await createAdminAttributeOption(optionForm.definitionId, payload);
      }
      patchDefinitionOptions(optionForm.definitionId, (options) => {
        const withoutSaved = options.filter((item) => item.id !== savedOption.id);
        return [...withoutSaved, savedOption];
      });
      setOpenDefinitionIds((current) => new Set([...current, optionForm.definitionId]));
      setOptionForm(null);
      await refreshDefinitions();
      await refreshAllDefinitions();
      await refreshCategoryAttributes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Option impossible à enregistrer.");
    } finally {
      setSaving(false);
    }
  };

  const toggleOption = async (definitionId: string, option: AttributeOption) => {
    try {
      setSaving(true);
      setError("");
      const savedOption = await toggleAdminAttributeOption(definitionId, option.id);
      patchDefinitionOptions(definitionId, (options) =>
        options.map((item) => (item.id === savedOption.id ? savedOption : item)),
      );
      setOpenDefinitionIds((current) => new Set([...current, definitionId]));
      await refreshAllDefinitions();
      await refreshCategoryAttributes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Activation impossible pour cette option.");
    } finally {
      setSaving(false);
    }
  };

  const removeOption = async (definitionId: string, optionId: string) => {
    try {
      setSaving(true);
      setError("");
      await deleteAdminAttributeOption(definitionId, optionId);
      patchDefinitionOptions(definitionId, (options) =>
        options.filter((item) => item.id !== optionId),
      );
      setOpenDefinitionIds((current) => new Set([...current, definitionId]));
      await refreshAllDefinitions();
      await refreshCategoryAttributes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setSaving(false);
    }
  };

  const moveDefinition = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= definitions.length) return;
    const next = [...definitions];
    [next[index], next[target]] = [next[target], next[index]];
    setDefinitions(next);
    await reorderAdminAttributeDefinitions(next.map((item) => item.id))
      .then(setDefinitions)
      .catch(async (err) => {
        setError(err instanceof Error ? err.message : "Réorganisation impossible.");
        await refreshDefinitions();
      });
  };

  const moveOption = async (definition: AttributeDefinition, index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= definition.options.length) return;
    const options = [...definition.options];
    [options[index], options[target]] = [options[target], options[index]];
    setDefinitions((current) =>
      current.map((item) => (item.id === definition.id ? { ...item, options } : item)),
    );
    await reorderAdminAttributeOptions(
      definition.id,
      options.map((item) => item.id),
    )
      .then(setDefinitions)
      .catch(async (err) => {
        setError(err instanceof Error ? err.message : "Réorganisation impossible.");
        await refreshDefinitions();
      });
  };

  const moveAssociation = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (!selectedCategoryId || target < 0 || target >= categoryAttributes.length) return;
    const next = [...categoryAttributes];
    [next[index], next[target]] = [next[target], next[index]];
    setCategoryAttributes(next);
    await reorderAdminCategoryAttributes(
      selectedCategoryId,
      next.map((item) => item.id),
    )
      .then(setCategoryAttributes)
      .catch(async (err) => {
        setError(err instanceof Error ? err.message : "Réorganisation impossible.");
        await refreshCategoryAttributes();
      });
  };

  const assignAttribute = async () => {
    if (!selectedCategoryId) {
      setError("Sélectionnez une catégorie ou une sous-catégorie.");
      return;
    }
    if (!assignId) {
      setError("Sélectionnez un attribut à associer.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await assignAdminCategoryAttribute(selectedCategoryId, {
        attributeDefinitionId: assignId,
        required: assignRequired,
        filterable: assignFilterable,
        sortOrder: categoryAttributes.length,
      });
      setAssignId("");
      setAssignRequired(false);
      setAssignFilterable(true);
      await refreshCategoryAttributes();
      await refreshDefinitions();
      await refreshAllDefinitions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Association impossible pour cette catégorie.");
    } finally {
      setSaving(false);
    }
  };

  const selectedIds = new Set(
    categoryAttributes
      .map((item) => item.attributeDefinitionId || item.attributeDefinition?.id)
      .filter(Boolean),
  );
  const assignableDefinitions = allDefinitions.filter(
    (item) => item.id && !selectedIds.has(item.id),
  );

  return (
    <>
      <AdminHeader
        title="Attributs & filtres"
        subtitle="Configurez les filtres dynamiques du catalogue"
        actions={
          <Button size="sm" onClick={() => openDefinition()}>
            <Plus className="h-4 w-4" />
            Nouvel attribut
          </Button>
        }
      />

      <div className="grid flex-1 gap-3 p-3 sm:p-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-3">
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {loading && (
            <div className="rounded-md border border-border px-4 py-3 text-sm text-muted-foreground">
              Chargement des attributs…
            </div>
          )}

          <Card className="p-3">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
              <Input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Rechercher un attribut"
                aria-label="Rechercher un attribut"
              />
              <Select
                value={sort}
                onValueChange={(value) => {
                  setPage(1);
                  setSort(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Ordre</SelectItem>
                  <SelectItem value="label-asc">Nom A-Z</SelectItem>
                  <SelectItem value="label-desc">Nom Z-A</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="active">Actifs d'abord</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {definitions.map((definition, index) => {
            const isExpanded = openDefinitionIds.has(definition.id);
            return (
              <Card key={definition.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-muted"
                          onClick={() =>
                            setOpenDefinitionIds((current) => {
                              const next = new Set(current);
                              if (next.has(definition.id)) next.delete(definition.id);
                              else next.add(definition.id);
                              return next;
                            })
                          }
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Replier l'attribut" : "Déplier l'attribut"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {definition.label}
                        <Badge variant="secondary">{definition.type}</Badge>
                        {!definition.isActive && <Badge variant="outline">Inactif</Badge>}
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {definition.options.length} option
                        {definition.options.length > 1 ? "s" : ""} · {definition.categoryCount}{" "}
                        catégorie
                        {definition.categoryCount > 1 ? "s" : ""} liée
                        {definition.categoryCount > 1 ? "s" : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Clé : {definition.key}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {supportsOptions(definition.type) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOption(definition)}
                          disabled={saving}
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter une option
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveDefinition(index, -1)}
                        disabled={index === 0 || saving}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveDefinition(index, 1)}
                        disabled={index === definitions.length - 1 || saving}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDefinition(definition)}>
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          toggleAdminAttributeDefinition(definition.id)
                            .then(async () => {
                              await refreshDefinitions();
                              await refreshAllDefinitions();
                            })
                            .catch((err) =>
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Activation impossible pour cet attribut.",
                              ),
                            )
                        }
                        disabled={saving}
                      >
                        {definition.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() =>
                          deleteAdminAttributeDefinition(definition.id)
                            .then(async () => {
                              await refreshDefinitions();
                              await refreshAllDefinitions();
                            })
                            .catch((err) =>
                              setError(
                                err instanceof Error ? err.message : "Suppression impossible.",
                              ),
                            )
                        }
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Options</p>
                    </div>
                    {definition.options.length ? (
                      <div className="space-y-2">
                        {definition.options.map((option, optionIndex) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm">{option.label}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {option.value}
                              </p>
                            </div>
                            {!option.isActive && <Badge variant="outline">Inactif</Badge>}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveOption(definition, optionIndex, -1)}
                              disabled={optionIndex === 0 || saving}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveOption(definition, optionIndex, 1)}
                              disabled={optionIndex === definition.options.length - 1 || saving}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openOption(definition, option)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => void toggleOption(definition.id, option)}
                              disabled={saving}
                            >
                              {option.isActive ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => void removeOption(definition.id, option.id)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {supportsOptions(definition.type)
                          ? "Aucune option configurée."
                          : "Ce type n'utilise pas d'options."}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          <div className="flex flex-col gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {pagination.page} / {pagination.totalPages} · {pagination.total} attribut
              {pagination.total > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={pagination.page <= 1 || loading}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages))}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Associations catégories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Catégorie ou sous-catégorie</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(value) => {
                  setSelectedCategoryId(value);
                  void refreshCategoryAttributes(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border p-3">
              <div className="space-y-3">
                <Label>Associer un attribut</Label>
                <Select value={assignId} onValueChange={setAssignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un attribut" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableDefinitions.map((definition) => (
                      <SelectItem key={definition.id} value={definition.id}>
                        {definition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Obligatoire</Label>
                  <Switch checked={assignRequired} onCheckedChange={setAssignRequired} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Utilisable comme filtre</Label>
                  <Switch checked={assignFilterable} onCheckedChange={setAssignFilterable} />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={assignAttribute}
                  disabled={!assignId || saving}
                >
                  Associer
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {categoryAttributes.map((association, index) => (
                <div key={association.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{association.attributeDefinition.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {association.attributeDefinition.key}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveAssociation(index, -1)}
                      disabled={index === 0 || saving}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveAssociation(index, 1)}
                      disabled={index === categoryAttributes.length - 1 || saving}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() =>
                        deleteAdminCategoryAttribute(selectedCategoryId, association.id)
                          .then(() => refreshCategoryAttributes())
                          .catch((err) =>
                            setError(
                              err instanceof Error ? err.message : "Suppression impossible.",
                            ),
                          )
                      }
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                      <Label className="text-xs">Obligatoire</Label>
                      <Switch
                        checked={association.required}
                        onCheckedChange={(required) =>
                          updateAdminCategoryAttribute(selectedCategoryId, association.id, {
                            required,
                          })
                            .then(() => refreshCategoryAttributes())
                            .catch((err) =>
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Modification de l'association impossible.",
                              ),
                            )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                      <Label className="text-xs">Filtre</Label>
                      <Switch
                        checked={association.filterable}
                        onCheckedChange={(filterable) =>
                          updateAdminCategoryAttribute(selectedCategoryId, association.id, {
                            filterable,
                          })
                            .then(() => refreshCategoryAttributes())
                            .catch((err) =>
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Modification de l'association impossible.",
                              ),
                            )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              {!categoryAttributes.length && (
                <p className="text-sm text-muted-foreground">Aucun attribut associé.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(definitionForm)}
        onOpenChange={(open) => !open && setDefinitionForm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {definitionForm?.id ? "Modifier l'attribut" : "Nouvel attribut"}
            </DialogTitle>
          </DialogHeader>
          {definitionForm && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Clé</Label>
                <Input
                  value={definitionForm.key}
                  onChange={(event) =>
                    setDefinitionForm({ ...definitionForm, key: event.target.value })
                  }
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Libellé</Label>
                <Input
                  value={definitionForm.label}
                  onChange={(event) =>
                    setDefinitionForm({ ...definitionForm, label: event.target.value })
                  }
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={definitionForm.type}
                  onValueChange={(type) =>
                    setDefinitionForm({ ...definitionForm, type: type as AttributeType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  min="0"
                  value={definitionForm.sortOrder}
                  onChange={(event) =>
                    setDefinitionForm({ ...definitionForm, sortOrder: event.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Actif</Label>
                <Switch
                  checked={definitionForm.isActive}
                  onCheckedChange={(isActive) => setDefinitionForm({ ...definitionForm, isActive })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDefinitionForm(null)}>
              Annuler
            </Button>
            <Button onClick={saveDefinition} disabled={saving}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(optionForm)} onOpenChange={(open) => !open && setOptionForm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {optionForm?.option ? "Modifier l'option" : "Nouvelle option"}
            </DialogTitle>
          </DialogHeader>
          {optionForm && (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void saveOption();
              }}
            >
              <div className="space-y-1.5">
                <Label>Valeur</Label>
                <Input
                  value={optionForm.value}
                  onChange={(event) => setOptionForm({ ...optionForm, value: event.target.value })}
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Libellé</Label>
                <Input
                  value={optionForm.label}
                  onChange={(event) => setOptionForm({ ...optionForm, label: event.target.value })}
                  maxLength={160}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  min="0"
                  value={optionForm.sortOrder}
                  onChange={(event) =>
                    setOptionForm({ ...optionForm, sortOrder: event.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Active</Label>
                <Switch
                  checked={optionForm.isActive}
                  onCheckedChange={(isActive) => setOptionForm({ ...optionForm, isActive })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOptionForm(null)}>
                  Annuler
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    void saveOption();
                  }}
                >
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
