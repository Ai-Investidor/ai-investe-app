import { supabase } from "@boot/modules/supabase.js";
import { URLS } from "@constants/URLS.js";

async function currentUserId() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id;
}

export function onboardingService() {
    // ─── Perfil (Step 1) — profiles, via RPC ───
    async function getMyProfile() {
        const { data, error } = await supabase.rpc(URLS.RPC_GET_MY_PROFILE);
        if (error) throw error;
        return data;
    }

    async function updateMyProfile({
        dateOfBirth,
        maritalStatusId,
        onboardingCompleted,
        onboardingCurrentStep,
    }) {
        const payload = {};
        if (dateOfBirth !== undefined) payload.data_nascimento = dateOfBirth;
        if (maritalStatusId !== undefined)
            payload.marital_status_id = maritalStatusId;
        if (onboardingCompleted !== undefined)
            payload.onboarding_completed = onboardingCompleted;
        if (onboardingCurrentStep !== undefined)
            payload.onboarding_current_step = onboardingCurrentStep;

        const { data, error } = await supabase.rpc(URLS.RPC_UPDATE_MY_PROFILE, {
            data: payload,
        });
        if (error) throw error;
        return data;
    }

    // ─── Dependentes (Step 1) — user_dependents, direto ───
    async function getDependents() {
        const { data, error } = await supabase
            .from(URLS.TABLE_USER_DEPENDENTS)
            .select("*")
            .order("created_at");
        if (error) throw error;
        return data;
    }

    async function addDependent({
        relationship,
        birthDate,
        isFinanciallyDependent = true,
    }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_USER_DEPENDENTS)
            .insert({
                user_id: await currentUserId(),
                relationship,
                birth_date: birthDate,
                is_financially_dependent: isFinanciallyDependent,
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async function removeDependent(id) {
        const { error } = await supabase
            .from(URLS.TABLE_USER_DEPENDENTS)
            .delete()
            .eq("id", id);
        if (error) throw error;
    }

    async function replaceDependents(list) {
        const existing = await getDependents();
        await Promise.all(existing.map((row) => removeDependent(row.id)));
        return Promise.all(list.map((item) => addDependent(item)));
    }

    // ─── Perfil profissional e renda (Step 2) — financial_profiles, via RPC ───
    async function getMyFinancialProfile() {
        const { data, error } = await supabase.rpc(
            URLS.RPC_GET_MY_FINANCIAL_PROFILE,
        );
        if (error) throw error;
        return data;
    }

    async function upsertMyFinancialProfile({
        employmentTypeId,
        netMonthlyIncome,
    }) {
        const payload = {};
        if (employmentTypeId !== undefined)
            payload.employment_type_id = employmentTypeId;
        if (netMonthlyIncome !== undefined)
            payload.net_monthly_income = netMonthlyIncome;

        const { data, error } = await supabase.rpc(
            URLS.RPC_UPSERT_MY_FINANCIAL_PROFILE,
            { data: payload },
        );
        if (error) throw error;
        return data;
    }

    // ─── Fluxo de caixa mensal (Step 3) — monthly_cash_flows, direto ───
    async function getLatestCashFlow() {
        const { data, error } = await supabase
            .from(URLS.TABLE_MONTHLY_CASH_FLOWS)
            .select("*")
            .order("month", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw error;
        return data;
    }

    async function createCashFlow({
        month,
        fixedCosts,
        variableCosts,
        totalSavings,
        savingsRate,
    }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_MONTHLY_CASH_FLOWS)
            .upsert(
                {
                    user_id: await currentUserId(),
                    month,
                    fixed_costs: fixedCosts,
                    variable_costs: variableCosts,
                    total_savings: totalSavings,
                    savings_rate: savingsRate,
                },
                { onConflict: "user_id,month" },
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Reserva de emergência (Step 4) — emergency_reserves, direto (1:1) ───
    async function getEmergencyReserve() {
        const { data, error } = await supabase
            .from(URLS.TABLE_EMERGENCY_RESERVES)
            .select("*")
            .maybeSingle();
        if (error) throw error;
        return data;
    }

    async function upsertEmergencyReserve({
        amount,
        monthsCovered,
        allocation,
    }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_EMERGENCY_RESERVES)
            .upsert(
                {
                    user_id: await currentUserId(),
                    amount,
                    months_covered: monthsCovered,
                    allocation,
                },
                { onConflict: "user_id" },
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Dívidas (Step 4) — debts, direto ───
    async function getDebts() {
        const { data, error } = await supabase
            .from(URLS.TABLE_DEBTS)
            .select("*")
            .order("created_at");
        if (error) throw error;
        return data;
    }

    async function addDebt({ name, type, balance, interestRate }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_DEBTS)
            .insert({
                user_id: await currentUserId(),
                name,
                type,
                balance,
                interest_rate: interestRate,
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async function removeDebt(id) {
        const { error } = await supabase
            .from(URLS.TABLE_DEBTS)
            .delete()
            .eq("id", id);
        if (error) throw error;
    }

    async function replaceDebts(list) {
        const existing = await getDebts();
        await Promise.all(existing.map((row) => removeDebt(row.id)));
        return Promise.all(list.map((item) => addDebt(item)));
    }

    // ─── Patrimônio (Step 5) — profile_net_worth, direto (1:1) ───
    async function getNetWorth() {
        const { data, error } = await supabase
            .from(URLS.TABLE_PROFILE_NET_WORTH)
            .select("*")
            .maybeSingle();
        if (error) throw error;
        return data;
    }

    async function upsertNetWorth({ totalAssets, totalLiabilities }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_PROFILE_NET_WORTH)
            .upsert(
                {
                    user_id: await currentUserId(),
                    total_assets: totalAssets,
                    total_liabilities: totalLiabilities,
                },
                { onConflict: "user_id" },
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Investimentos atuais (Step 5) — profile_investments, direto ───
    async function getInvestments() {
        const { data, error } = await supabase
            .from(URLS.TABLE_PROFILE_INVESTMENTS)
            .select("*")
            .order("created_at");
        if (error) throw error;
        return data;
    }

    async function addInvestment({ assetName, assetClass, amount }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_PROFILE_INVESTMENTS)
            .insert({
                user_id: await currentUserId(),
                asset_name: assetName,
                asset_class: assetClass,
                amount,
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async function removeInvestment(id) {
        const { error } = await supabase
            .from(URLS.TABLE_PROFILE_INVESTMENTS)
            .delete()
            .eq("id", id);
        if (error) throw error;
    }

    async function replaceInvestments(list) {
        const existing = await getInvestments();
        await Promise.all(existing.map((row) => removeInvestment(row.id)));
        return Promise.all(list.map((item) => addInvestment(item)));
    }

    // ─── Objetivos e horizontes (Step 6) — financial_goals, direto ───
    async function getGoals() {
        const { data, error } = await supabase
            .from(URLS.TABLE_FINANCIAL_GOALS)
            .select("*")
            .order("created_at");
        if (error) throw error;
        return data;
    }

    async function addGoal({
        title,
        category,
        targetAmount,
        deadline,
        isMain = false,
    }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_FINANCIAL_GOALS)
            .insert({
                user_id: await currentUserId(),
                title,
                category,
                target_amount: targetAmount,
                deadline,
                is_main: isMain,
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async function removeGoal(id) {
        const { error } = await supabase
            .from(URLS.TABLE_FINANCIAL_GOALS)
            .delete()
            .eq("id", id);
        if (error) throw error;
    }

    async function replaceGoals(list) {
        const existing = await getGoals();
        await Promise.all(existing.map((row) => removeGoal(row.id)));
        return Promise.all(list.map((item) => addGoal(item)));
    }

    // ─── Tolerância a risco (Step 7) — risk_tolerance_profile, direto (1:1) ───
    async function getRiskToleranceProfile() {
        const { data, error } = await supabase
            .from(URLS.TABLE_RISK_TOLERANCE_PROFILE)
            .select("*")
            .maybeSingle();
        if (error) throw error;
        return data;
    }

    async function upsertRiskToleranceProfile({
        reactionTo20PercentDrop,
        guaranteedGainPreference,
        pastBehaviorDescription,
        painPoint,
    }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_RISK_TOLERANCE_PROFILE)
            .upsert(
                {
                    user_id: await currentUserId(),
                    reaction_to_20_percent_drop: reactionTo20PercentDrop,
                    guaranteed_gain_preference: guaranteedGainPreference,
                    past_behavior_description: pastBehaviorDescription,
                    pain_point: painPoint,
                },
                { onConflict: "user_id" },
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ─── Conhecimento e autopercepção (Step 8) — user_knowledge_profile, direto (1:1) ───
    async function getKnowledgeProfile() {
        const { data, error } = await supabase
            .from(URLS.TABLE_USER_KNOWLEDGE_PROFILE)
            .select("*")
            .maybeSingle();
        if (error) throw error;
        return data;
    }

    async function upsertKnowledgeProfile({
        knowledgeLevel,
        selfPerceptionNotes,
    }) {
        const { data, error } = await supabase
            .from(URLS.TABLE_USER_KNOWLEDGE_PROFILE)
            .upsert(
                {
                    user_id: await currentUserId(),
                    knowledge_level: knowledgeLevel,
                    self_perception_notes: selfPerceptionNotes,
                },
                { onConflict: "user_id" },
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    return {
        getMyProfile,
        updateMyProfile,
        getDependents,
        addDependent,
        removeDependent,
        replaceDependents,
        getMyFinancialProfile,
        upsertMyFinancialProfile,
        getLatestCashFlow,
        createCashFlow,
        getEmergencyReserve,
        upsertEmergencyReserve,
        getDebts,
        addDebt,
        removeDebt,
        replaceDebts,
        getNetWorth,
        upsertNetWorth,
        getInvestments,
        addInvestment,
        removeInvestment,
        replaceInvestments,
        getGoals,
        addGoal,
        removeGoal,
        replaceGoals,
        getRiskToleranceProfile,
        upsertRiskToleranceProfile,
        getKnowledgeProfile,
        upsertKnowledgeProfile,
    };
}
