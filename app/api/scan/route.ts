import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { code_slug, image_base64, user_id } = await req.json();

    if (!code_slug) {
      return NextResponse.json({ error: 'code_slug required' }, { status: 400 });
    }

    // Lookup the QR code
    const { data: code, error: codeError } = await supabaseAdmin
      .from('qr_codes')
      .select('*')
      .eq('code_slug', code_slug)
      .single();

    if (codeError || !code) {
      return NextResponse.json({ error: 'code_not_found' }, { status: 404 });
    }

    // Update scan count
    await supabaseAdmin
      .from('qr_codes')
      .update({ scan_count: (code.scan_count || 0) + 1 })
      .eq('id', code.id);

    // Analyze image context with Claude if image provided
    let contextAnalysis = null;
    let agentResponse = '';

    if (image_base64 && image_base64.length > 100) {
      try {
        // Strip data URL prefix if present
        const base64Data = image_base64.replace(/^data:image\/[a-z]+;base64,/, '');

        const contextResponse = await anthropic.messages.create({
          model: 'claude-opus-4-5',
          max_tokens: 512,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: base64Data,
                  },
                },
                {
                  type: 'text',
                  text: 'You are analyzing the visual environment around a QR code to provide context for an AI agent response. Identify: (1) surface/material the QR is on, (2) surrounding objects/space, (3) lighting, (4) any brand marks or signage. Return JSON only: {"surface": "...", "environment": "...", "lighting": "...", "brands_visible": [], "context_summary": "..."}',
                },
              ],
            },
          ],
        });

        const contextText = contextResponse.content[0].type === 'text'
          ? contextResponse.content[0].text
          : '{}';

        try {
          const jsonMatch = contextText.match(/\{[\s\S]*\}/);
          contextAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch {
          contextAnalysis = { context_summary: contextText };
        }

        // Generate agent response based on context
        const agentPrompt = code.agent_id === 'qr-plus-demo'
          ? `You are the QR+ demo agent demonstrating US Patent 19/636,192 (Agentive QR+ Identity and Interaction System). 
             
             The user has scanned a demo QR code. Visual context analysis shows: ${JSON.stringify(contextAnalysis)}
             
             Respond in 2-3 sentences starting with "QR+ is working." Then describe what you can see in their environment, then explain this demonstrates the patent claim: camera captures visual context around QR codes for agent intelligence.`
          : `You are an intelligent QR+ agent (ID: ${code.agent_id || 'default'}). 
             The user scanned a QR code in this context: ${JSON.stringify(contextAnalysis)}.
             ${code.context_hints ? `Additional context hints: ${JSON.stringify(code.context_hints)}` : ''}
             Provide a helpful, contextually aware response in 2-3 sentences.`;

        const agentResp = await anthropic.messages.create({
          model: 'claude-opus-4-5',
          max_tokens: 300,
          messages: [{ role: 'user', content: agentPrompt }],
        });

        agentResponse = agentResp.content[0].type === 'text'
          ? agentResp.content[0].text
          : 'QR+ is working. Context captured successfully.';

      } catch (claudeErr) {
        console.error('Claude error:', claudeErr);
        agentResponse = code.agent_id === 'qr-plus-demo'
          ? "QR+ is working. This is a live demonstration of US Patent 19/636,192 — the agentive QR code interaction system."
          : `QR+ code /${code_slug} recognized. Connect your camera for full context analysis.`;
      }
    } else {
      // No image — basic response
      agentResponse = code.agent_id === 'qr-plus-demo'
        ? "QR+ is working. This is a live demonstration of US Patent 19/636,192. For full context intelligence, allow camera access."
        : `QR+ code /${code_slug} recognized. Allow camera access for full context-aware agent response.`;
    }

    // Log the scan
    await supabaseAdmin.from('qr_scans').insert({
      code_id: code.id,
      user_id: user_id || null,
      image_captured: !!(image_base64 && image_base64.length > 100),
      context_analysis: contextAnalysis,
      agent_response: agentResponse,
      device_info: { user_agent: req.headers.get('user-agent') || 'unknown' },
    });

    return NextResponse.json({
      agent_response: agentResponse,
      context_analysis: contextAnalysis,
      code_info: {
        code_slug: code.code_slug,
        agent_id: code.agent_id,
      },
    });

  } catch (err) {
    console.error('Scan API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
