import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { CreateTournamentDto, RegisterTeamDto } from './dto/tournaments.dto';

interface RegisteredTeam {
  equipo_id: string;
  equipo_nombre: string;
  deporte: string | null;
  capitan_nombre: string;
  inscrito_en: string;
}

interface BracketMatch {
  match_id: string;
  ronda: string;
  equipo_a: string | null;
  equipo_b: string | null;
  goles_a: number | null;
  goles_b: number | null;
  ganador: string | null;
  estado: 'PENDIENTE' | 'JUGADO';
}

interface Bracket {
  generado_en: string;
  rondas: Record<string, BracketMatch[]>;
  campeon: string | null;
}

interface Tournament {
  id: string;
  nombre: string;
  deporte: string;
  organizador_id: string;
  organizador_nombre: string;
  fecha_inicio: string;
  cupo_maximo: number;
  precio_inscripcion: number;
  estado: string;
  equipos: RegisteredTeam[];
  bracket?: Bracket;
}

const tournamentStore: Record<string, Tournament> = {};

export class TournamentsService {
  static async createTournament(creatorId: string, dto: CreateTournamentDto): Promise<Tournament> {
    const user = await prisma.usuario.findUnique({ where: { id: creatorId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const tournamentId = `tourn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newTournament: Tournament = {
      id: tournamentId,
      nombre: dto.nombre,
      deporte: dto.deporte.toUpperCase(),
      organizador_id: creatorId,
      organizador_nombre: user.nombre,
      fecha_inicio: dto.fecha_inicio,
      cupo_maximo: dto.cupo_maximo,
      precio_inscripcion: dto.precio_inscripcion,
      estado: 'INSCRIPCIONES_ABIERTAS',
      equipos: [],
    };

    tournamentStore[tournamentId] = newTournament;
    return newTournament;
  }

  static async getOpenTournaments(): Promise<Tournament[]> {
    const list = Object.values(tournamentStore);
    if (list.length === 0) {
      // Seed default initial tournament if empty
      const defaultId = 'tourn_default_1';
      tournamentStore[defaultId] = {
        id: defaultId,
        nombre: 'Copa Apertura PlayConnect 2026',
        deporte: 'FUTBOL',
        organizador_id: 'org_admin',
        organizador_nombre: 'Centro Deportivo Central',
        fecha_inicio: '2026-09-15',
        cupo_maximo: 8,
        precio_inscripcion: 15000,
        estado: 'INSCRIPCIONES_ABIERTAS',
        equipos: [],
      };
      return [tournamentStore[defaultId]];
    }
    return list;
  }

  static async getTournamentById(tournamentId: string): Promise<Tournament> {
    const t = tournamentStore[tournamentId];
    if (!t) throw new AppError('Torneo no encontrado', 404);
    return t;
  }

  static async registerTeam(tournamentId: string, requesterId: string, dto: RegisterTeamDto): Promise<Tournament> {
    const t = tournamentStore[tournamentId];
    if (!t) throw new AppError('Torneo no encontrado', 404);

    if (t.equipos.length >= t.cupo_maximo) {
      throw new AppError('El torneo ha alcanzado el cupo máximo de equipos', 400);
    }

    const existing = t.equipos.find((e) => e.equipo_id === dto.equipo_id);
    if (existing) {
      throw new AppError('Este equipo ya está inscrito en el torneo', 400);
    }

    const team = await prisma.equipo.findUnique({
      where: { id: dto.equipo_id },
      include: { creador: { select: { nombre: true } } },
    });

    if (!team) throw new AppError('Equipo no encontrado', 404);

    t.equipos.push({
      equipo_id: team.id,
      equipo_nombre: team.nombre,
      deporte: team.deporte,
      capitan_nombre: team.creador.nombre,
      inscrito_en: new Date().toISOString(),
    });

    if (t.equipos.length >= t.cupo_maximo) {
      t.estado = 'CUPO_COMPLETO';
    }

    return t;
  }

  // HU-25: Generate elimination bracket
  static async generateBracket(tournamentId: string, requesterId: string): Promise<Bracket> {
    const t = tournamentStore[tournamentId];
    if (!t) throw new AppError('Torneo no encontrado', 404);
    if (t.organizador_id !== requesterId) throw new AppError('Solo el organizador puede generar el cuadro', 403);
    if (t.equipos.length < 2) throw new AppError('Se necesitan al menos 2 equipos inscritos para generar el bracket', 400);
    if (t.bracket) throw new AppError('El cuadro de brackets ya fue generado para este torneo', 400);

    // Shuffle teams for random seeding
    const shuffled = [...t.equipos].sort(() => Math.random() - 0.5);

    const rondas: Record<string, BracketMatch[]> = {};

    // Determine rounds based on team count
    const numTeams = shuffled.length;
    let rondaNombre = '';

    if (numTeams >= 8) rondaNombre = 'Cuartos de Final';
    else if (numTeams >= 4) rondaNombre = 'Semifinales';
    else rondaNombre = 'Final';

    const firstRoundMatches: BracketMatch[] = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      firstRoundMatches.push({
        match_id: `match_${Date.now()}_${i}`,
        ronda: rondaNombre,
        equipo_a: shuffled[i]?.equipo_nombre || null,
        equipo_b: shuffled[i + 1]?.equipo_nombre || null,
        goles_a: null,
        goles_b: null,
        ganador: null,
        estado: 'PENDIENTE',
      });
    }

    rondas[rondaNombre] = firstRoundMatches;

    // Add subsequent rounds as placeholders
    const numMatches = firstRoundMatches.length;
    if (numMatches >= 4) {
      const semis: BracketMatch[] = [];
      for (let i = 0; i < Math.floor(numMatches / 2); i++) {
        semis.push({
          match_id: `semi_${Date.now()}_${i}`,
          ronda: 'Semifinales',
          equipo_a: null,
          equipo_b: null,
          goles_a: null,
          goles_b: null,
          ganador: null,
          estado: 'PENDIENTE',
        });
      }
      rondas['Semifinales'] = semis;
    }

    if (numMatches >= 2) {
      rondas['Final'] = [{
        match_id: `final_${Date.now()}`,
        ronda: 'Final',
        equipo_a: null,
        equipo_b: null,
        goles_a: null,
        goles_b: null,
        ganador: null,
        estado: 'PENDIENTE',
      }];
    }

    const bracket: Bracket = {
      generado_en: new Date().toISOString(),
      rondas,
      campeon: null,
    };

    t.bracket = bracket;
    t.estado = 'EN_CURSO';
    return bracket;
  }

  static async getBracket(tournamentId: string): Promise<Bracket> {
    const t = tournamentStore[tournamentId];
    if (!t) throw new AppError('Torneo no encontrado', 404);
    if (!t.bracket) throw new AppError('El cuadro de brackets aún no ha sido generado', 400);
    return t.bracket;
  }

  // HU-26: Update match score and advance winner
  static async updateMatchScore(
    tournamentId: string,
    matchId: string,
    golesA: number,
    golesB: number,
  ): Promise<{ bracket: Bracket; ganador: string | null }> {
    const t = tournamentStore[tournamentId];
    if (!t) throw new AppError('Torneo no encontrado', 404);
    if (!t.bracket) throw new AppError('El cuadro de brackets aún no ha sido generado', 400);

    let foundMatch: BracketMatch | null = null;
    let foundRonda = '';

    for (const [ronda, matches] of Object.entries(t.bracket.rondas)) {
      const m = matches.find((m) => m.match_id === matchId);
      if (m) { foundMatch = m; foundRonda = ronda; break; }
    }

    if (!foundMatch) throw new AppError('Partido no encontrado en el cuadro', 404);
    if (foundMatch.estado === 'JUGADO') throw new AppError('Este partido ya tiene resultado registrado', 400);

    foundMatch.goles_a = golesA;
    foundMatch.goles_b = golesB;
    foundMatch.estado = 'JUGADO';
    foundMatch.ganador = golesA > golesB ? foundMatch.equipo_a : golesA < golesB ? foundMatch.equipo_b : null;

    // Advance winner to the next round
    if (foundMatch.ganador) {
      const rounds = ['Cuartos de Final', 'Semifinales', 'Final'];
      const currentIdx = rounds.indexOf(foundRonda);
      const nextRound = rounds[currentIdx + 1];

      if (nextRound && t.bracket.rondas[nextRound]) {
        const nextMatches = t.bracket.rondas[nextRound];
        // Find first match with an open slot
        const nextMatch = nextMatches.find((m) => m.equipo_a === null || m.equipo_b === null);
        if (nextMatch) {
          if (nextMatch.equipo_a === null) nextMatch.equipo_a = foundMatch.ganador;
          else nextMatch.equipo_b = foundMatch.ganador;
        }
      } else if (foundRonda === 'Final') {
        // Crown the champion
        t.bracket.campeon = foundMatch.ganador;
        t.estado = 'FINALIZADO';
      }
    }

    return { bracket: t.bracket, ganador: foundMatch.ganador };
  }
}
